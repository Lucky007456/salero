# 🍌 Banana Cultivation Billing Software — Implementation Plan

## Overview

A full-stack billing and bill-tracking web application for a large-scale banana cultivation business in Tamil Nadu, India. The app enables creating sale bills with detailed weight entries, tracking payment statuses, viewing bill history with filters, and exporting professional PDF bills.

## User Review Required

> [!IMPORTANT]
> **Firebase Authentication**: The plan uses Firebase Auth with Email/Password login. Should we also add Google Sign-In, or is email/password sufficient?

> [!IMPORTANT]  
> **Firebase Project**: You are not currently logged into Firebase CLI. I'll set up the app with a local Firebase config placeholder. You'll need to:
> 1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
> 2. Enable Firestore and Authentication
> 3. Paste your Firebase config into the `.env` file
> 
> Alternatively, if you want me to create the project via Firebase CLI, please log in first using `firebase login`.

> [!WARNING]
> **Tailwind CSS Version**: The user requested Tailwind CSS. I'll use **Tailwind CSS v3** (via PostCSS) as it has the most stable React integration. v4 is available but has different setup patterns.

---

## Proposed Changes

### Phase 1: Project Setup & Foundation

#### [NEW] Project scaffolding with Vite + React
- Initialize Vite React project in `d:\slaero operation`
- Install dependencies: `react-router-dom`, `firebase`, `jspdf`, `jspdf-autotable`, `lucide-react`
- Configure Tailwind CSS v3 with custom green agriculture theme

#### [NEW] `src/firebase.js` — Firebase configuration
- Firebase app initialization with Firestore and Auth
- Environment variable-based config (`.env` file)

#### [NEW] `tailwind.config.js` — Custom theme
- Custom green color palette (emerald/green tones)
- Large touch-friendly spacing and font sizes
- Mobile-first breakpoints

#### [NEW] `src/index.css` — Global styles
- Tailwind directives + custom utilities
- Indian Rupee formatting, large button styles

---

### Phase 2: New Sale Bill Form

#### [NEW] `src/components/NewSaleBill.jsx`
- Merchant name input
- Date picker (default today)  
- Banana variety dropdown: Nendran, Robusta, Red Banana, Poovan, G9, Rasthali + Custom
- **Weight Entry Table**: Dynamic rows with [Quantity (thars)] [Total Weight (kg)]
  - Add Row / Remove Row
  - Auto-calculate: Total Quantity & Total Gross Weight
- Wastage input with validation (≤ gross weight)
- Auto-calculated: Net Weight = Gross - Wastage
- Rate per kg (₹) input
- Auto-calculated: Total Amount = Net Weight × Rate
- Bill Summary panel
- Payment status: Paid / Partial / Pending
  - Partial → amount paid input → balance due
- Save → generates Bill ID (`BILL-2025-001` format)

#### [NEW] `src/services/billService.js`
- Firestore CRUD for bills
- Bill ID generation with sequential numbering
- Payment status updates

---

### Phase 3: Bill History / Dashboard

#### [NEW] `src/components/Dashboard.jsx`
- Summary cards: Total sales (month), Total kg sold, Pending payments
- Bill list table with: Bill ID, Merchant, Date, Variety, Net Weight, Amount, Status
- Filters: merchant name, date range, payment status
- Click row → view/edit bill details

#### [NEW] `src/components/BillDetail.jsx`
- Full bill detail view
- Edit capability for all fields
- Payment status update

---

### Phase 4: PDF Export

#### [NEW] `src/services/pdfService.js`
- Clean, professional bill PDF using jsPDF + autoTable
- Includes all bill fields: ID, merchant, date, variety, weight table, wastage, net weight, rate, total, payment status
- Indian format for currency (₹1,25,000)
- Compact layout suitable for WhatsApp sharing

---

### Phase 5: Auth & Polish

#### [NEW] `src/components/Login.jsx`
- Simple email/password login
- "Remember me" option

#### [NEW] `src/components/Layout.jsx`
- App shell with navigation
- Mobile-friendly bottom nav / sidebar
- Green agriculture theme

#### [NEW] `src/utils/format.js`
- Indian number formatting (₹1,25,000)
- Date formatting
- Bilingual labels (English / Tamil)

---

## Project Structure

```
d:\slaero operation\
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Layout.jsx
│   │   ├── Login.jsx
│   │   ├── NewSaleBill.jsx
│   │   ├── Dashboard.jsx
│   │   ├── BillDetail.jsx
│   │   └── ui/
│   │       ├── Button.jsx
│   │       ├── Input.jsx
│   │       ├── Select.jsx
│   │       └── Card.jsx
│   ├── services/
│   │   ├── billService.js
│   │   └── pdfService.js
│   ├── utils/
│   │   └── format.js
│   ├── firebase.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── package.json
```

---

## Open Questions

> [!IMPORTANT]
> 1. **Firebase Project**: Do you already have a Firebase project created? If yes, please share the Firebase config (apiKey, projectId, etc.). If not, shall I guide you through creating one?
> 2. **Authentication**: Is email/password login sufficient, or do you need Google Sign-In too?
> 3. **Multiple Users**: Should multiple users be able to log in, or is this a single-user app?
> 4. **Offline Support**: Should the app work offline (Firebase offline persistence)?

---

## Verification Plan

### Automated Tests
- Test all auto-calculations with sample data
- Validate wastage cannot exceed gross weight
- Verify Indian currency formatting
- Test Bill ID generation sequence

### Browser Testing
- Take screenshots at each milestone:
  1. Project setup complete with green theme
  2. New Sale Bill form functional
  3. Dashboard with sample data
  4. PDF export output
- Test on mobile viewport (375px width)

### Manual Verification
- Create 3-4 test bills with different varieties and payment statuses
- Verify PDF output is clean and readable
- Test all filters on dashboard
