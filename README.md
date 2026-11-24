# Workflow Studio — website

Responsive, static business website ready for GitHub Pages. No framework, build process, or paid hosting required.

## Before publishing

1. Replace the provisional name `Workflow Studio` / `workflow.studio` with the final company name in `index.html`.
2. Replace `hello@example.com` in `index.html` (constant `CONTACT_EMAIL`) with the company's real public email. Until then, the contact form will show a configuration reminder instead of sending an inquiry.
3. Review the service descriptions and industry examples for accuracy.

## Deploy through GitHub Pages

1. On the professional GitHub account, create a **public** repository named `<your-username>.github.io` (substitute the exact GitHub username).
2. Upload `index.html`, `favicon.svg`, and `.nojekyll` into the repository root on the `main` branch.
3. In repository **Settings → Pages**, set **Build and deployment → Source: Deploy from a branch**, branch **main**, folder **/(root)**, and Save.
4. Your site will become accessible at `https://<your-username>.github.io/` after deployment completes.

GitHub Pages hosts static content publicly. Do not place private keys or confidential information in this repository.

## Contact form

The form uses a `mailto:` link and needs a working email client on the visitor's device. For a reliable, hosted contact form without requiring email client software, integrate a form service later.
