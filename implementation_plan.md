# 🍌 Salero — E-Commerce & Admin Dashboard Implementation Plan

## Overview

We are transforming **Salero** from an internal billing system into a dual-purpose platform:
1. **Secure Admin Dashboard**: The existing, robust billing software will be preserved and secured under an `/admin` route. It will continue to handle internal sales, billing history, statistics, and PDF exports without any disruption.
2. **Public E-Commerce Storefront**: A new public-facing website where customers can browse banana varieties, add them to a cart, purchase them online, and make inquiries.

This approach perfectly separates the "front of house" (customer store) from the "back of house" (internal billing and management), exactly as you envisioned!

## User Review Required

> [!IMPORTANT]
> **Payment Gateway Selection**: Since the original plan mentioned Tamil Nadu, India, I highly recommend using **Razorpay** for receiving money online. It supports UPI, Credit/Debit cards, and Netbanking out of the box and is the industry standard for Indian businesses. If you prefer **Stripe** or another provider, please let me know.

> [!IMPORTANT]
> **E-Commerce Scope**: For selling bananas online, do we want to sell by the **Kilogram** or by the **Thar (bunch)**? Do we need to enforce a minimum order quantity (e.g., minimum 5 kg)?

> [!WARNING]
> **Delivery Logistics**: Online orders typically require delivery addresses and shipping fees. Should we include a standard shipping fee calculation, or is it local pickup only?

---

## Proposed Changes

### Phase 1: Storefront Foundation (In Progress/Completed)

The foundational routing has already been successfully split in the application (`App.jsx`), establishing `<PublicLayout>` for the storefront and `<AdminLayout>` for the secure dashboard.

### Phase 2: Online Shop & Shopping Cart

#### [NEW] `src/pages/public/Shop.jsx`
- Product catalog displaying available banana varieties (Nendran, Robusta, Red Banana, Poovan, G9, Rasthali).
- Beautiful product cards with images, prices per kg/thar, and "Add to Cart" buttons.
- Modern, dynamic UI with micro-animations (Framer Motion).

#### [NEW] `src/context/CartContext.jsx`
- Global state management for the shopping cart.
- Add/Remove items, update quantities, and calculate subtotal.
- Persist cart data in `localStorage` so customers don't lose items if they refresh.

#### [NEW] `src/components/public/CartDrawer.jsx`
- A slide-out sidebar or modal showing current cart contents.
- "Proceed to Checkout" button.

### Phase 3: Checkout & Online Payments

#### [NEW] `src/pages/public/Checkout.jsx`
- Customer details form (Name, Phone, Email, Delivery Address).
- Order summary.
- Integration with payment gateway (e.g., Razorpay standard checkout).

#### [NEW] `src/services/paymentService.js`
- Logic to initialize payment gateway scripts.
- Verifying payment success and storing the new "Online Order" in Firebase.

### Phase 4: Inquiry System

#### [NEW] `src/pages/public/Contact.jsx`
- A professional contact form for customers to inquire about bulk orders, specific varieties, or general questions.
- Fields: Name, Phone Number, Inquiry Type, Message.
- On submit, saves the inquiry to a new `inquiries` collection in Firebase.

### Phase 5: Admin Dashboard Expansions

We will add two new sections to your existing Admin Dashboard without changing the core billing logic:

#### [NEW] `src/components/admin/OnlineOrders.jsx`
- A dashboard view for admins to see incoming online orders.
- Mark orders as "Processing", "Shipped", or "Delivered".

#### [NEW] `src/components/admin/Inquiries.jsx`
- A view to read and manage customer messages submitted from the public contact form.
- Mark inquiries as "Read" or "Responded".

---

## Verification Plan

### Automated Tests
- Validate cart logic (price calculations, item quantities).
- Test form validation on the Contact and Checkout pages.

### Manual Verification
- **Payment Flow**: We will run test transactions in "Test Mode" (via Razorpay or Stripe) to ensure money flows correctly and orders are recorded in Firebase.
- **Admin Isolation**: Verify that the `/admin` routes remain strictly password-protected and that the internal billing system functions exactly as it did before.
- **Mobile Responsiveness**: Ensure the storefront looks premium and functions perfectly on mobile devices.
