# Word Template QA Tool

Created by Jessi Marshall to help streamline the QA process of Word templates within my organization.

## Live Demo

Access the hosted app here: [https://jemaxmars.github.io/Word-Template-QA-Tool/](https://jemaxmars.github.io/Word-Template-QA-Tool/)

## Purpose
This tool is designed to make it easier and faster to review, test, and validate Word templates, reducing manual effort and improving consistency across documents.

## Features
- Upload and review Word templates
- Automated checks for formatting and content consistency
- User-friendly interface for QA workflows
- Designed for internal use to support the document QA process
- **Automatic schema loading from static file**
- **Manual schema import fallback UI**

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm start
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Schema Loading

- On startup, the app automatically loads all entity schemas from the static file at `public/schemas/schemas.json`.
- If you need to update schemas, you can either:
  - Replace the `schemas.json` file with a new version and redeploy, or
  - Use the “Paste All Schemas” button in the UI to import new schema data (this will override the static file in your browser’s local storage).
- The manual “Paste All Schemas” and per-entity paste options remain available as a fallback.

## Running Tests

To run tests:
```bash
npm test
```

## Build

To create a production build:
```bash
npm run build
```

## Author
Jessi Marshall

---
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
