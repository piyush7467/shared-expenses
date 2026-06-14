# Project Scope: MoneyMap

This document defines the functional boundaries, key capabilities, target users, and future roadmap of the **MoneyMap** application. 

---

## 1. Project Goal

The primary goal of MoneyMap is to take the stress out of personal finance and group splitting. It addresses two core user needs:
1. **Shared Ledgers (Groups)**: Perfect for roommates sharing rent, travel groups splitting vacation costs, or families tracking mutual costs. It automatically calculates who owes whom and suggests the absolute minimum transactions needed to settle up.
2. **Personal Wallet**: A completely private space for individual users to monitor their personal income and spending patterns using a clean ledger interface.

MoneyMap is designed as a cross-platform system, accessible via a web app (built with React + Vite) and an installable native **Android Mobile App (APK)** that users can download directly from the portal.

---

## 2. Target Users & System Roles

* **Group Creator / Admin**: The user who initiates a group, describes its purpose, and generates the unique invitation code.
* **Group Member**: Users who join via an invite code. They can view the shared ledger, record expenses, toggle active participants for custom splits, log settlements, import CSV transaction histories, and view debt recommendations.
* **Departed Member**: When a user leaves a group, their access is immediately revoked and they can no longer be added to new transactions. However, to maintain absolute mathematical integrity of historical balance sheets, their historic split weights and records are permanently frozen in the system instead of being deleted.
* **Personal Finance User**: Every registered user gets a private "My Wallet" workspace. Data stored here is strictly secure and never exposed to group calculations or other users.

---

## 3. In-Scope Features

### User Accounts & Interface
* Token-based secure registration, login, and authorization.
* Responsive Navigation Drawer that shifts seamlessly between desktop monitors and mobile screens.
* Dynamic theme toggle supporting Light and Dark modes with clean CSS variables.
* Real-time client-side input validations and notifications.

### Group Bill Splitting Mechanics
* **Equal Splits**: Divides the total cost equally among selected members.
* **Exact Splits**: Assigns specific, custom currency amounts to each member.
* **Percentage Splits**: Divides bills by custom percentages (with automated checks verifying they total exactly 100%).
* Supports transactions in both **INR** and **USD** currencies. When saving a transaction, users can specify an exchange rate, and MoneyMap automatically normalizes the entry into the base currency (**INR**) for settlement calculations.

### Centralized Expense Categories Module
MoneyMap utilizes a unified Expense Categories Module to standardize data across all sections of the application, including the web portal and the Android APK package. 
* **Purpose**:
  * Standardize expense classification across the application so that users have a unified, clean database structure.
  * Improve analytics and financial reporting accuracy by grouping data consistently.
  * Enhance future AI-generated financial insights by using detailed, well-structured categories.
  * Simplify category management and future updates by modifying a single source-of-truth variable (`expenseCategories`).
  * Provide users with a wide range of real-world spending and income options.
* **Included Categories**:
  * *Food & Grocery* — Meals, groceries, dining out.
  * *Transport & Fuel* — Public transport, rides, fuel, car maintenance.
  * *Travel & Taxi* — Flights, hotel bookings, out-of-town trips.
  * *Home & Room Rent* — Monthly rent, lease fees.
  * *Hostel & Utility Bills* — Electric, water, gas, hostel maintenance bills.
  * *Internet & Mobile Recharge* — WiFi, cellular plans, data packs.
  * *Education & Education Fees* — Schooling, college fees.
  * *Books & Online Courses* — Reading, educational materials, training programs.
  * *Health, Medical & Gym* — Diagnostics, medicines, health insurance, fitness centers.
  * *Shopping, Clothing & Electronics* — Personal items, apparel, home electronics.
  * *Entertainment, Gaming & Subscriptions* — Subscriptions, game portals, tickets.
  * *Salary, Savings & Investments* — Income deposits, savings logs, market investments.
  * *Insurance, EMI & Taxes* — Loan EMIs, health policies, tax payments.
  * *Personal Care & Child Care* — Grooming, child support, nursery items.
  * *Pets, Gifts & Donations* — Pet upkeep, holiday gifts, charity donations.
  * *Office, Business & Freelance Income* — Professional earnings, side projects, freelance payouts.
  * *Other Expenses* — General/miscellaneous items.
* **Benefits**:
  * Reusable across multiple screens and forms.
  * Reduces code duplication.
  * Improves user experience with comprehensive category options.
  * Enables better expense tracking and visualization.
  * Supports future multilingual implementation.
  * Helps AI analyze spending patterns more accurately.
  * Makes the application more production-ready and scalable.
* **Usage**:
  The `expenseCategories` variable is passed directly to the `ExpenseDropdown` component, allowing users to select a category while adding or editing expenses. The selected category is then used for analytics, budgeting, AI recommendations, reports, and expense filtering throughout the MoneyMap application.

### Private Wallet Ledger
* Personal, secure dashboard displaying Total Income, Total Expenses, and Net Balance.
* Dynamic category-wise charts using standard categories.
* Transaction history filters sorted by category type and custom date ranges.

### Automated CSV Importer & Verification Engine
* Upload bulk transaction spreadsheets via standard CSV files.
* Checks row entries against a robust 12-rule validation grid:
  1. *Duplicate check*: Flags transactions with identical amounts, names, and groups within a 1-hour window.
  2. *Invalid dates*: Identifies future dates or corrupt date formats.
  3. *Unregistered users*: Verifies that the emails specified in the CSV match active, registered MoneyMap members.
  4. *Non-positive amounts*: Flags values $\le 0$.
  5. *Unsupported currencies*: Flags entries that are not INR or USD.
  6. *Split mathematical mismatches*: Flags percentage distributions that do not sum to 100% or totals that do not match split values.
  7. *Repayment labels*: Flags rows with words like "settle" or "payback" logged as standard expenses.
  8. *Active period overlap*: Flags transactions dated before a member joined or after a member left the group.
* Rejects entries with severe validation errors immediately to prevent data corruption.
* Imports warning-level records as `PENDING` status. These show up in the group dashboard for member verification, keeping the final balances secure until a human clicks approve.

---

## 4. Out-of-Scope (Future Features)
* Automated integration with foreign exchange API providers (currently relies on manual entry or base rate conversions).
* Push notifications (SMS/Email alerts) when added to split bills.
* Direct in-app payments (UPI, PayPal, Stripe) for resolving balances.
