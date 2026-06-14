# AI Partnership Log: MoneyMap

This log documents the collaboration between the AI coding assistant and the developer during the creation and deployment of MoneyMap.

---

## 1. Role of AI Assistant

The AI assistant acted as an active pair programmer to help build and refine MoneyMap:
* **Database Design**: Designed the PostgreSQL schemas managed by Prisma, mapping out the relationships between Users, Groups, Memberships, Expenses, Splits, Settlements, and Personal Wallet Transactions.
* **Core Logic Engines**: Designed the greedy matchmaking debt solver, balance calculator, and the 12-rule CSV validation parser.
* **Frontend UI & Themes**: Crafted responsive dashboard layouts and forms using Tailwind CSS, glassmorphic panels, and a theme switcher that respects light/dark mode preferences.
* **Deployment Optimization**: Configured serverless database connection routing for Supabase to handle Vercel's pooler architecture, and set up the `postinstall` prisma triggers to run during builds.
* **Centralized Expense Categories**: Structured the `expenseCategories` module as a single source of truth for both the group forms and private wallet widgets, laying the groundwork for future AI-driven budget reviews.

---

## 2. Rationale & Prompts Flow

1. **Prisma Schema Generation**:
   - Mapped rejoining-history constraints like `@@unique([userId, groupId, joinedAt])` to preserve historical integrity.
2. **Greedy Matchmaking Engine**:
   - Coded the solver to calculate individual net positions and match debtors/creditors sequentially to minimize transactions.
3. **CSV Imports & Anomaly Engine**:
   - Structured the importer to separate raw failures from warning-level anomalies (e.g. duplicate check, date timeline violations).
4. **Unified Theme Compatibility**:
   - Refactored pages to inherit body backgrounds and standardized typography to prevent text disappearing in Light Mode.
5. **Standardized Categories**:
   - Consolidated 17 real-world spending/income categories to keep data structures consistent across the web client and APK file.

---

## 3. Human Code Reviews & Verification

* Verified that decimal calculations use safe numerical conversions to avoid precision drift.
* Confirmed that user auth tokens are stored securely in local storage and passed via request headers.
* Tested the local Vite production build to verify zero compile or bundle warnings.
* Validated database query performance under Vercel serverless functions by implementing Supabase's transaction pooler.
