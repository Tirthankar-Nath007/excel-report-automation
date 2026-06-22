# Perfios Report Processor

Internal tool for the TVSCS Product Team. Processes raw Perfios Account Aggregator transaction report Excel files and generates consolidated summary reports.

---

## Overview

The application accepts Perfios `TransactionReport-*-ONLINE-*.xlsx` files and produces formatted Excel reports with side-by-side portfolio summaries covering:

- **Data Source Summary** — transaction counts by source type (ACCOUNT_AGGREGATOR, NETBANKING_FETCH, STATEMENT, etc.)
- **Error Summary** — error code distribution for ACCOUNT_AGGREGATOR transactions

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI, Python 3.12 |
| Excel Processing | pandas, openpyxl |
| Validation | Pydantic v2 |
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS v4 |
| State Management | React Query |
| Forms | React Hook Form + Zod |

---

## Project Structure

```
excel-automation/
├── app/                        # FastAPI backend
│   ├── main.py                 # App entry point, CORS config
│   ├── routers/
│   │   └── reports.py          # API endpoints
│   ├── services/
│   │   ├── report_processing.py   # Core Excel parsing + aggregation
│   │   ├── portfolio_detection.py # Portfolio name from filename/folder
│   │   ├── validation.py          # Date coverage validation
│   │   ├── excel_export.py        # openpyxl report generation
│   │   └── report_merge.py        # Merging existing reports
│   ├── schemas/
│   │   └── reports.py          # Pydantic request/response models
│   ├── models/
│   │   └── report.py           # Internal dataclasses
│   └── utils/
│       └── filename_parser.py  # Portfolio + date extraction from filenames
├── frontend/                   # Vite + React frontend
│   └── src/
│       ├── pages/              # Tab 1, 2, 3
│       ├── components/         # UI, upload, validation components
│       ├── hooks/              # React Query mutations
│       ├── services/api.ts     # Typed API client
│       ├── types/index.ts      # Shared TypeScript interfaces
│       └── utils/              # Client-side portfolio detection, download
├── src/                        # Original CLI scripts (unchanged)
├── reports/                    # Sample input files
└── requirements.txt
```

---

## Setup

### Prerequisites

- Python 3.12
- Node.js 18+

### Backend

```bash
# From project root
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # Mac/Linux

pip install -r requirements.txt
```

### Frontend

```bash
cd frontend
npm install
```

---

## Running

Start both servers in separate terminals from the **project root**.

**Backend:**
```bash
uvicorn app.main:app --reload
# Runs on http://localhost:8000
```

**Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

The Vite dev server proxies all `/api` requests to the backend automatically.

---

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/reports/process` | Process raw Perfios files → download Excel |
| `POST` | `/api/reports/merge` | Merge generated portfolio reports → download Excel |
| `POST` | `/api/reports/folder-process` | Process a folder upload → download Excel |
| `POST` | `/api/reports/validate` | Validate date coverage for uploaded files |

Interactive API docs available at `http://localhost:8000/docs` when the backend is running.

---

## Workflows

### Tab 1 — Transaction Upload

Upload individual raw Perfios `TransactionReport-*-ONLINE-*.xlsx` files.

- Portfolio is auto-detected from the filename and can be overridden per file
- Files without `ONLINE` in the name are silently rejected
- Maximum 30 files
- Validates date coverage before generating (does not block generation)
- Downloads: `report_{portfolio}_{DD-MM-YYYY}_to_{DD-MM-YYYY}.xlsx`

### Tab 2 — Merge Reports

Merge previously generated single-portfolio reports into one combined file.

- Input: files named `report_{portfolio}_{from}_to_{to}.xlsx`
- Validates that all inputs share the same date range
- Does **not** reprocess raw data — reads the `_data` sheet written by this app
- Downloads: `report_{portfolio1}_{portfolio2}_{from}_to_{to}.xlsx`

### Tab 3 — Folder Upload (Primary)

Select a root folder containing portfolio sub-folders.

**Expected folder structure:**
```
root-folder/
├── commercial/
│   ├── TransactionReport-tvsCredit-insights-ONLINE-From-2026-06-01-To-2026-06-01.xlsx
│   └── ...
└── used_cars/
    ├── TransactionReport-tvscreditUsedcars-insights-ONLINE-From-2026-06-01-To-2026-06-01.xlsx
    └── ...
```

- Portfolios are auto-detected from both the sub-folder name and the filename
- Validates date coverage per portfolio
- Downloads a single combined report for all portfolios

---

## Input File Naming Convention

Files must follow Perfios' standard naming pattern:

```
TransactionReport-{portfolio}-insights-ONLINE-From-{YYYY-MM-DD}-To-{YYYY-MM-DD}.xlsx
```

Only files containing `ONLINE` (case-insensitive) are processed. All others are ignored.

---

## Portfolio Detection

Portfolio is derived from the filename using this rule:

1. Find `tvsCredit` in the filename (case-insensitive)
2. Extract any text immediately after it, up to the next `-`
3. If no text follows → `commercial`
4. Otherwise → lowercased extracted text

| Filename segment | Detected portfolio |
|------------------|--------------------|
| `tvsCredit` | `commercial` |
| `tvsCreditUsedcars` | `usedcars` |
| `tvsCreditTW` | `tw` |
| `tvsCreditPersonalLoans` | `personalloans` |

---

## Output Format

Each generated Excel file contains two sheets:

- **`Report`** — Human-readable formatted output with side-by-side portfolio sections, bold headers, borders, and auto-fit column widths
- **`_data`** — Machine-readable JSON used by the Merge workflow

Portfolio sections are laid out horizontally: Commercial starts at column A, the next portfolio at column L, and so on.

---

## Validation

The validation panel checks date coverage independently per portfolio. For a set of uploaded files, it determines the earliest date and verifies that every expected date in the selected window is present.

| Mode | Window |
|------|--------|
| One Week | 7 consecutive days from the earliest date |
| One Month | 30 consecutive days from the earliest date |
| Custom | N days (entered manually) |

Validation shows `✓ Complete` or `⚠ Missing N date(s)` with the exact missing dates listed. It does not block report generation.

---

## Extending for New Portfolios

No code changes are required to support new portfolios. Portfolio names are derived entirely from filenames at runtime. To add a new portfolio, simply upload files whose names contain the new portfolio segment (e.g. `tvsCreditSCV` → detected as `scv`).

To improve folder-name detection for a new portfolio, add an entry to `_FOLDER_MAP` in [app/services/portfolio_detection.py](app/services/portfolio_detection.py).
