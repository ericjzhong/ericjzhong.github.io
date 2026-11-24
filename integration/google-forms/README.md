# AIAS Google Forms contact intake

The website currently uses FormSubmit. Do not remove it until the new Google Form has been created and tested.

## Activate with the Eric work Gmail account

1. Sign in at https://script.google.com as **eric.j.zhong@gmail.com**.
2. Create a **New project**, paste the contents of `aias-contact-setup.gs` into `Code.gs`, and save.
3. Select `setupAIASContact` and click **Run**. Review and approve Google's permissions. The script creates a Google Form, linked response spreadsheet, and an installable trigger that sends each inquiry to both founders.
4. Open **Execution log** and copy the **Embed URL**, **Form editor**, and **Response spreadsheet** URL. The script saves the form ID so rerunning the setup in the same script project doesn't duplicate the form.
5. Submit a real test entry from the public form URL. Verify that **eric.j.zhong@gmail.com** and **chaunceysmith2001@gmail.com** both receive the notification, and check that the response appears in the spreadsheet.
6. Give the Embed URL to the website maintainer to replace the existing FormSubmit form with an embedded Google Form. The embedding can stay inside the AIAS Contact section. The Form itself displays an inline confirmation upon submission.

## Important constraints

- A Google Form embedded through an iframe will display Google's form interface and Google's built-in response confirmation **inside the iframe**, not a custom HTML form. Full visual customization and hiding all Google branding require a different architecture.
- The script's email notification is sent under the Google account that installs the trigger.
- Do not add credentials or API secrets to the public GitHub repository.
- The submission trigger must be tested with a real response. Running `notifyAIASFounders` manually does not create a submission event.
