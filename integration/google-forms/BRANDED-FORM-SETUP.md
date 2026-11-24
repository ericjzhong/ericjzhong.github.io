# Branded AIAS contact form — activate Google Apps Script

The website includes a custom styled HTML form with four fields, validation, a consent notice, spam honeypot, and an in-page confirmation. **The embedded Google Form remains visible until the backend deployment URL is installed.** Do not insert a placeholder Apps Script URL.

## Deployment (in existing account, about 5 clicks)

1. Open the **same** Google Apps Script project where you ran `setupAIASContact()` as `eric.j.zhong@gmail.com`.
2. Add a file named `ContactWebApp.gs` and paste `aias-contact-webapp.gs` into it. Keep your original setup script.
3. Click **Deploy > New deployment > Select type: Web app**.
4. Set **Execute as: Me** and **Who has access: Anyone**. Approve the Google authorization prompts. Use the `/exec` deployment URL, NOT the `/dev` editor-only URL.
5. Send the resulting `https://script.google.com/macros/s/.../exec` URL to the website maintainer. They will set `AIAS_CONTACT_WEB_APP_URL` in `index.html` and remove the fallback embed.
6. Submit a real inquiry on the website and verify a new response in the existing Google Form/Sheet and a notification in both founders' inboxes.

## Technical notes

- The website submits a standard HTML form into a hidden iframe rather than using cross-origin fetch. The Apps Script returns a `postMessage` acknowledgement. The website checks the origin and submission ID before showing success.
- On a backend timeout or failure, the page shows a direct email option and does **not** falsely claim success.
- Programmatic Google Form submissions do not activate Google Forms submission triggers. The web app explicitly emails both recipients via `MailApp` to avoid losing notifications.
- Use a separate domain and additional spam protection if the form receives abusive traffic. This is a lightweight lead-intake system; do not solicit sensitive records.
- If modifying the server code after deployment, redeploy a new version under **Manage deployments**.
