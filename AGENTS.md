# Repository Guidelines

## Project Structure & Architecture

The frontend is a static single-page application. Keep browser code in `index.html`; it contains React/Babel UI code, styles, configuration constants, and components. Static assets such as `manifest.json` and the app icons live at the repository root. Vercel deploys this repository.

The backend lives in the Google Sheets-bound Apps Script project, in `TurnoSync.gs`, rather than in this repository. It handles authentication, reads and writes sheet data, email notifications, and WhatsApp calls. It uses the `orden A` and `Registro Cambios` sheets. Update frontend and Apps Script together when request payloads or API responses change.

Use `main` for production. The staging branch is `staging-(pruebas)`; its frontend must retain the staging Apps Script `/exec` endpoint.

## Development and Verification

There is no package manifest, build command, test runner, or linter. The app uses CDN-hosted React and Babel. For a local UI check, serve the repository root:

```sh
npx serve .
```

Verify login, doctor loading, shift creation, history, and cancellation. For end-to-end checks, deploy `staging-(pruebas)` with Vercel and confirm records are written only to the TurnoSync staging spreadsheet.

## Coding Style & Naming

Use two-space indentation in JavaScript and JSX. Prefer `const` and `let`; avoid new `var` declarations. Use camelCase for variables and functions, PascalCase for React components, and UPPER_SNAKE_CASE for configuration constants such as `GOOGLE_SCRIPT_URL`.

Keep edits localized and preserve existing Spanish UI copy and component patterns. Do not introduce a bundler or framework migration unless requested.

## Testing and Staging Safety

Automated tests are not present, so document manual test results. Use test-only emails and numbers in staging. The Apps Script WhatsApp sender must override every recipient with the designated test number. Never commit WhatsApp tokens, Google secrets, or real contact data.

## Commits and Pull Requests

Write short, imperative commit messages, for example `Fix staging script endpoint`. Work on `staging-(pruebas)`, validate its Vercel URL, and describe frontend, Apps Script, and sheet impact in pull requests. Attach screenshots for UI changes.
