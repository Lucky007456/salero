# 🍌 ALPHOVINS GLOBAL AGRO EXPORTS - Banana Cultivation Billing System

![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white) 
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Firebase](https://img.shields.io/badge/firebase-%23039BE5.svg?style=for-the-badge&logo=firebase)

A modern, responsive, and bilingual (English/Tamil) web application built specifically for large-scale banana cultivation and merchant trading operations.

## ✨ Key Features
- **Smart Billing**: Dynamic calculation of gross weight, net weight (auto-deducting wastage), and final amounts.
- **Bilingual UI**: Seamless support for local farmers in Tamil Nadu with integrated Tamil translations.
- **Offline Reliability**: Dual-layer storage (Firebase Cloud + LocalStorage Fallback) allows uninterrupted billing even without an internet connection.
- **Detailed PDF Invoices**: Generates professional PDF invoices containing unique Bill ID, Merchant Name, and full weight details using `file-saver` and `jspdf`.
- **Financial Tracking**: Tracks partial payments and pending balances per bill.
- **Premium Aesthetics**: Glassmorphism UI, smooth micro-animations, and a cohesive "Emerald/Green" nature theme.

## 🚀 Live Demo
*(If deployed, add your Vercel or Netlify link here)*

## 🛠️ Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Lucide React Icons
- **Backend/Auth**: Firebase Firestore & Firebase Authentication (Email/Password)
- **PDF Generation**: `jspdf`, `jspdf-autotable`, `file-saver`

## ⚙️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/salero.git
   cd salero
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory and add your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY="your-api-key"
   VITE_FIREBASE_AUTH_DOMAIN="your-auth-domain"
   VITE_FIREBASE_PROJECT_ID="your-project-id"
   VITE_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   VITE_FIREBASE_APP_ID="your-app-id"
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🔒 Security Constraints
Please note that all `.env` files containing Firebase API keys and secrets are explicitly ignored via `.gitignore` and **MUST NOT** be pushed to GitHub.

---
*Built for ALPHOVINS GLOBAL AGRO EXPORTS by Lakshmanan R.*
