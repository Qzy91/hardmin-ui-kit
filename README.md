# Hardmin UI Kit

A tool for prototyping UI pages using HardminCloud's design system — powered by Claude AI.

## Prerequisites

- **Node.js** v18 or higher — [nodejs.org](https://nodejs.org)
- **Claude Code CLI** — install once in terminal:
  ```bash
  npm install -g @anthropic-ai/claude-code
  ```
  Then log in: `claude` (opens browser for authentication)

## Setup

```bash
# 1. Clone the repository
git clone https://github.com/Qzy91/hardmin-ui-kit.git
cd hardmin-ui-kit

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open [http://localhost:5200](http://localhost:5200) in your browser.

## How to create a page

Open the project folder in terminal and start Claude:

```bash
claude
```

Then describe what you want in plain language, for example:

> "Vytvoř novou sekci Uživatelé se seznamem uživatelů v tabulce"

> "Přidej stránku s formulářem pro editaci faktury do sekce Fakturační modul"

> "Vytvoř dashboard s přehledem statistik pro sekci EMS"

Claude will ask a few clarifying questions and then build the page. The browser refreshes automatically.

## How to navigate

The sidebar on the left lists all created sections and pages. Click any item to open it.

Detail and edit pages are not listed in the sidebar — navigate to them by clicking a row in the table.

## Useful commands

```bash
npm run dev      # start dev server
npm run types    # TypeScript check
npm run build    # production build → dist/
```
