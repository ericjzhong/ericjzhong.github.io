/**
 * AIAS Contact Intake — run once from https://script.google.com while signed
 * into eric.j.zhong@gmail.com.
 *
 * Creates a Google Form, linked response spreadsheet and an installable
 * notification trigger. Run setupAIASContact() exactly once.
 */
const AIAS_RECIPIENTS = ['eric.j.zhong@gmail.com', 'chaunceysmith2001@gmail.com'];

function setupAIASContact() {
  const existing = PropertiesService.getScriptProperties().getProperty('AIAS_FORM_ID');
  if (existing) {
    const form = FormApp.openById(existing);
    if (form.supportsAdvancedResponderPermissions()) {
      form.setPublished(true);
      console.log('Published: ' + form.isPublished());
    }
    form.setAcceptingResponses(true);
    console.log('Accepting responses: ' + form.isAcceptingResponses());
    console.log('Existing Form editor: ' + form.getEditUrl());
    console.log('Existing Form public: ' + form.getPublishedUrl());
    console.log('Embed URL: ' + form.getPublishedUrl().replace(/\/viewform(\?.*)?$/, '/viewform?embedded=true'));
    return;
  }
  const form = FormApp.create('AIAS | Project Inquiry');
  form.setDescription('Tell us a little about your organization and what you want to improve. Do not include confidential or sensitive information.');
  form.setConfirmationMessage('Thank you! Your inquiry has been received. We will be in touch soon.');
  if (form.supportsAdvancedResponderPermissions()) form.setPublished(true);
  form.setAcceptingResponses(true);
  form.addTextItem().setTitle('Name').setRequired(true);
  const email = form.addTextItem().setTitle('Work email').setRequired(true);
  email.setValidation(FormApp.createTextValidation().requireTextIsEmail().build());
  form.addTextItem().setTitle('Company').setRequired(false);
  form.addParagraphTextItem().setTitle('What would you like to improve?').setRequired(true);
  const sheet = SpreadsheetApp.create('AIAS | Contact Form Responses');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());
  ScriptApp.newTrigger('notifyAIASFounders').forForm(form).onFormSubmit().create();
  PropertiesService.getScriptProperties().setProperty('AIAS_FORM_ID', form.getId());
  console.log('Form editor: ' + form.getEditUrl());
  console.log('Form public URL: ' + form.getPublishedUrl());
  console.log('Embed URL: ' + form.getPublishedUrl().replace(/\/viewform(\?.*)?$/, '/viewform?embedded=true'));
  console.log('Response spreadsheet: ' + sheet.getUrl());
}
function notifyAIASFounders(e) {
  if (!e || !e.response) throw new Error('This function runs from a real form submission, not the editor Run button.');
  const answers = {};
  e.response.getItemResponses().forEach(item => {
    answers[item.getItem().getTitle()] = String(item.getResponse() || '');
  });
  const company = answers['Company'] || answers['Name'] || 'New inquiry';
  const subject = 'New AIAS website inquiry: ' + company.slice(0, 90);
  const body = [
    'A new AIAS website inquiry was received.',
    '',
    'Name: ' + (answers['Name'] || ''),
    'Work email: ' + (answers['Work email'] || ''),
    'Company: ' + (answers['Company'] || ''),
    '',
    'Project details:',
    answers['What would you like to improve?'] || '',
    '',
    'Submitted: ' + e.response.getTimestamp(),
    'Review the response in the AIAS contact response spreadsheet.'
  ].join('\n');
  MailApp.sendEmail({
    to: AIAS_RECIPIENTS.join(','),
    subject,
    body,
    name: 'AIAS Contact Intake',
    replyTo: answers['Work email'] || 'eric.j.zhong@gmail.com'
  });
}
