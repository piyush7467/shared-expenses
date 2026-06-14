# MoneyMap

Welcome to **MoneyMap**! MoneyMap is a full-stack financial application designed to make managing money simple and intuitive. Whether you want to split household bills with flatmates, track vacation costs with friends, or keep a detailed private journal of your own income and spending, MoneyMap has you covered.

Our stack is built around a secure **Node.js (Express)** backend connected to a **PostgreSQL database** (hosted on Supabase) via the **Prisma ORM**. On the front end, we built a highly responsive, modern single-page application using **React (Vite)** and **Tailwind CSS**, styled with a beautiful glassmorphic theme and full light/dark mode support. 

To make it even more accessible, we have compiled an **Android Mobile App (APK)** (`moneymap.apk`), which is served directly from the backend's public folder so you can download and install it on your mobile devices.

---

## Centralized Expense Categories Module

To ensure unified classification, clean database records, and scalable analytics, MoneyMap implements a centralized **Expense Categories Module**. Instead of hardcoding categories across different views, all available spending and income categories are defined in a single, reusable variable called `expenseCategories`. 

This description outlines the module that coordinates categories for both the web interface and the native APK file.

### Purpose
* **Standardize expense classification**: Keep spending logs organized under a standard set of categories across the entire system.
* **Improve analytics and reporting accuracy**: Avoid fragmented reports by grouping data cleanly for charts and filters.
* **Enhance AI-generated insights**: Prepare transactional data for smart AI financial advice using clean, predictable categories.
* **Simplify management**: Make future changes (like adding or renaming categories) from a single code definition instead of chasing down hardcoded strings.
* **Offer realistic options**: Provide a comprehensive selection that covers standard daily transactions.

### Included Categories
Here is the curated list of categories defined in the module:
* **Food & Grocery** — Groceries, dining out, and food delivery.
* **Transport & Fuel** — Gas, vehicle maintenance, and public transit.
* **Travel & Taxi** — Cabs, flights, hotels, and holiday bookings.
* **Home & Room Rent** — Monthly rent and housing costs.
* **Hostel & Utility Bills** — Electricity, water, gas, and waste disposal.
* **Internet & Mobile Recharge** — Phone bills, broadband, and data packs.
* **Education & Education Fees** — Tuition, school fees, and academic costs.
* **Books & Online Courses** — Self-improvement, textbooks, and e-learning.
* **Health, Medical & Gym** — Doctor visits, medicines, insurance, and gym memberships.
* **Shopping, Clothing & Electronics** — Clothes, gadgets, and personal purchases.
* **Entertainment, Gaming & Subscriptions** — Streaming services, movies, video games, and leisure.
* **Salary, Savings & Investments** — Incoming wages, deposits, and investment deposits.
* **Insurance, EMI & Taxes** — Loan repayments, insurance premiums, and tax compliance.
* **Personal Care & Child Care** — Haircuts, cosmetics, school runs, and children's supplies.
* **Pets, Gifts & Donations** — Pet food, vet bills, birthday gifts, and charity.
* **Office, Business & Freelance Income** — Side hustles, consulting, office supplies, and business income.
* **Other Expenses** — Miscellaneous logs that don't fit anywhere else.

### Benefits
* **Reusable Codebase**: Shared directly between the group splitting forms, personal ledgers, and transaction filters.
* **DRY Code**: Drastically reduces code duplication.
* **Better User Experience**: Simple, intuitive options that feel natural to pick from.
* **Data Visualization**: Directly maps to visual charts (pie charts, bar diagrams) and expense tracking summaries.
* **Multilingual Ready**: Easily supports localization/translation updates in the future.
* **AI Readiness**: Allows algorithms to detect patterns (e.g. "You spent 15% more on Travel & Taxi this month") with high accuracy.
* **Production-Grade Scalability**: Sets up the database schema for clean categorization.

### Usage
The `expenseCategories` array is imported and passed directly to the `ExpenseDropdown` React component. When adding or editing an expense, users pick a category from this drop-down list. Once saved, this category tag is used to generate analytics, budget reports, group summaries, custom CSV exports, and AI recommendations throughout MoneyMap.

---

## Codebase Structure

Here is how the project files are laid out:

```text
shared-expenses-app/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma        # Database models & Prisma client configuration
│   ├── public/
│   │   └── moneymap.apk         # Compiled Android Mobile App release build
│   ├── src/
│   │   ├── config/              # Prisma Client wrapper initialization
│   │   ├── controllers/         # Handles logic for auth, groups, expenses, and wallet ledger
│   │   ├── middleware/          # JWT auth validation & multer middlewares
│   │   ├── routes/              # Express endpoint routers
│   │   ├── services/            # Group settlements solver, csv generation & parser
│   │   ├── utils/               # Math verifiers & mock database diagnostic scripts
│   │   └── index.js             # Express application main runner (Vercel-ready)
│   ├── .env                     # Local environment settings (ignored by git)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── assets/              # Static visual branding assets
│   │   ├── components/          # Shared components (Navbar, Protected checks, layout wraps)
│   │   ├── context/             # Global contexts (Auth management & toast notifications)
│   │   ├── pages/               # Views (Login, Signup, Dash, Groups, Personal Wallet)
│   │   ├── services/            # API client wrapper config (axios settings)
│   │   └── App.jsx              # Main client router
│   ├── index.html
│   └── package.json
├── API.md                       # API endpoint schemas & payload examples
├── SCOPE.md                     # Features, boundaries, and project limits
├── DECISIONS.md                 # Architectural decision records & reasoning
├── AI_USAGE.md                 # Logs of assistant collaboration
└── shared_expenses_postman_collection.json  # Import collection for API manual testing
```

---

## Quick Start Guide

### Prerequisites
* **Node.js** (v18.x or newer)
* **PostgreSQL** database instance (Supabase is recommended for easy serverless connection pooling)

### 1. Database & Backend Setup
1. Move into the backend folder:
   ```bash
   cd backend
   ```
2. Install the package dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables by creating a `.env` file in the root of the `backend/` folder:
   ```env
   PORT=5000
   DATABASE_URL="postgres://your_pooler_url:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgres://your_direct_url:5432/postgres"
   JWT_SECRET="use-a-long-random-string-here"
   NODE_ENV="development"
   ```
4. Sync the schema models directly to your PostgreSQL database:
   ```bash
   npx prisma db push
   ```
5. Build the Prisma client package:
   ```bash
   npx prisma generate
   ```
6. Start the API local development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install package dependencies:
   ```bash
   npm install
   ```
3. Boot up the Vite dev server:
   ```bash
   npm run dev
   ```
4. Open your web browser to [http://localhost:5173](http://localhost:5173) and start using the app.

---

## Running Offline Code Tests

We have written standalone diagnostic checks to verify calculation solvers without making external API or database calls. These tests ensure the split mathematical models remain perfectly accurate.

To execute them, run the following in your terminal from the `backend/` folder:
```bash
node src/utils/test-engine.js
```

These diagnostics verify:
1. **Mathematical Accuracy**: Validates that equal-split fractions round decimal remainders fairly without leaking currency pennies.
2. **Greedy Debt Solver**: Ensures that mock group ledgers resolve complex loops (e.g. Alice owes Bob, Bob owes Charlie) into the absolute minimum count of direct peer-to-peer payments.
