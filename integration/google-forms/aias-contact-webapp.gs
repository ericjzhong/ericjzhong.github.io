/**
 * AIAS seamless contact form backend.
 * Paste into the SAME Apps Script project as aias-contact-setup.gs.
 * Deploy as Web app: Execute as Me; access Anyone.
 * Do NOT delete setupAIASContact or notifyAIASFounders.
 *
 * This submits to the existing Google Form and notifies BOTH founders directly.
 * Apps Script programmatic FormResponse.submit() does not fire form-submit
 * triggers, so we call MailApp explicitly here.
 */
const AIAS_SITE_ORIGIN = 'https://ericjzhong.github.io';

function doPost(e) {
  let requestId = '';
  function respond(status, detail) {
    const message = JSON.stringify({
      source: 'aias-contact-backend',
      status: status,
      requestId: requestId,
      detail: detail || ''
    });
    // HtmlService output runs in a Google sandbox. postMessage addresses the
    // top-level website without relying on third-party cookies or CORS fetch.
    // Apps Script HtmlService may render inside a nested Google iframe.
    // Notify both the immediate parent and the top-level AIAS page.
    const payload = JSON.stringify(JSON.parse(message));
    const origin = JSON.stringify(AIAS_SITE_ORIGIN);
    const script = '(function(){var p=' + payload + ';var o=' + origin +
      ';try{window.parent.postMessage(p,o)}catch(e){}' +
      'try{window.top.postMessage(p,o)}catch(e){}})();';
    const html = '<!doctype html><html><body><script>' + script +
      '</scr' + 'ipt><p>Submission processed.</p></body></html>';
    return HtmlService.createHtmlOutput(html).setTitle('AIAS contact submission');
  }
  try {
    if (!e || !e.parameter) throw new Error('Missing submission fields');
    const p = e.parameter;
    requestId = String(p.request_id || '').slice(0, 100);
    // Honeypot: deliberately do not generate a notification.
    if (String(p.website || '').trim()) return respond('ok');
    const name = String(p.name || '').trim().slice(0, 150);
    const email = String(p.email || '').trim().slice(0, 254);
    const company = String(p.company || '').trim().slice(0, 200);
    const message = String(p.message || '').trim().slice(0, 6000);
    if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return respond('error', 'Please fill out all required fields.');
    }
    if (String(p.consent || '') !== 'yes') {
      return respond('error', 'Please acknowledge the inquiry notice.');
    }
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const cache = CacheService.getScriptCache();
      const cacheKey = aiasContactKey_(requestId || name + email + message);
      if (cache.get(cacheKey) === 'ok') return respond('ok');
      const formId = PropertiesService.getScriptProperties().getProperty('AIAS_FORM_ID');
      if (!formId) throw new Error('Existing AIAS form not configured');
      const form = FormApp.openById(formId);
      const answers = {
        'Name': name,
        'Work email': email,
        'Company': company,
        'What would you like to improve?': message
      };
      let response = form.createResponse();
      form.getItems().forEach(item => {
        const label = item.getTitle();
        if (!(label in answers)) return;
        const type = item.getType();
        if (type === FormApp.ItemType.TEXT) {
          response = response.withItemResponse(item.asTextItem().createResponse(answers[label]));
        } else if (type === FormApp.ItemType.PARAGRAPH_TEXT) {
          response = response.withItemResponse(item.asParagraphTextItem().createResponse(answers[label]));
        }
      });
      response.submit();
      const subject = 'New AIAS website inquiry: ' + (company || name).slice(0, 90);
      const text = [
        'A new AIAS website inquiry was received.',
        '', 'Name: ' + name, 'Work email: ' + email, 'Company: ' + company,
        '', 'Project details:', message, '',
        'Submission ID: ' + requestId,
        'A copy is saved in the AIAS Google Form responses.'
      ].join('\n');
      MailApp.sendEmail({
        to: 'eric.j.zhong@gmail.com,chaunceysmith2001@gmail.com',
        subject: subject,
        body: text,
        name: 'AIAS Contact Intake',
        replyTo: email
      });
      cache.put(cacheKey, 'ok', 21600);
      return respond('ok');
    } finally {
      lock.releaseLock();
    }
  } catch (error) {
    console.error('AIAS contact submit failed', error);
    return respond('error', 'We could not confirm delivery. Please contact us by email.');
  }
}

/**
 * Cross-origin status check used by the AIAS website.
 * JSONP is limited to a fixed callback name; no response data or user details
 * are exposed, only whether this unpredictable submission ID was completed.
 */
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action !== 'status' || p.callback !== 'aiasContactStatusCallback') {
    return ContentService.createTextOutput('Unsupported request')
      .setMimeType(ContentService.MimeType.TEXT);
  }
  const id = String(p.request_id || '');
  if (!/^[A-Za-z0-9_-]{12,100}$/.test(id)) {
    return ContentService.createTextOutput('aiasContactStatusCallback({"status":"unknown"});')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  const key = aiasContactKey_(id);
  const delivered = CacheService.getScriptCache().get(key) === 'ok';
  const reply = 'aiasContactStatusCallback(' + JSON.stringify({
    requestId: id,
    status: delivered ? 'ok' : 'pending'
  }) + ');';
  return ContentService.createTextOutput(reply).setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function aiasContactKey_(id) {
  return 'aias_' + Utilities.base64EncodeWebSafe(
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, id)
  ).slice(0, 100);
}
