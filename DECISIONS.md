# Architectural Decisions: MoneyMap

This log documents the major design and engineering choices we made while building MoneyMap. Here, we outline the context behind our challenges and explain why we implemented these specific solutions.

---

## 1. Choosing PostgreSQL with Prisma ORM

* **Context**: We had to choose between a document database (like MongoDB) and a relational database (like PostgreSQL).
* **Decision**: We chose PostgreSQL, utilizing the Prisma ORM to manage schema migrations and type safety.
* **Rationale**: Expense managers are transactional and highly relational by nature. Entities like Users, Groups, Expenses, Splits, and Settlements form a tightly coupled graph. Relational constraints (such as making sure split targets exist, cascading deletes when bills are deleted, and keeping memberships locked to valid users) are crucial to prevent balance calculation errors. Prisma provides clean schema migrations and helps us query these complex joins.

---

## 2. Handling Group Departures (Soft Leaves vs. Hard Deletes)

* **Context**: When a user leaves a group, deleting their membership or user record from the database breaks historical ledger math, resulting in broken charts and database foreign key errors.
* **Decision**: We implemented a `leftAt` nullable timestamp on the `Membership` schema.
* **Rationale**:
  - Instead of hard-deleting the member, leaving a group sets `leftAt` to the current time.
  - When calculating historical balances, their past splits remain intact, ensuring the historical ledger is accurate.
  - If someone tries to add the departed member to a new expense dated after their departure, the system catches this in the CSV import/manual validation engine and flags it as an anomaly, rather than crashing the server.

---

## 3. Base Currency Conversion (INR Standard)

* **Context**: Users can record transactions in different currencies (INR and USD). We cannot sum or balance these currencies directly.
* **Decision**: We convert all split amounts to a single base currency (**INR**) at the time of creation and store the exchange rate.
* **Rationale**: Storing the original currency and amount preserves transaction details for users (e.g. showing a "$10 dinner"). However, converting and storing the base INR value (`originalAmount * exchangeRate`) directly on split records allows for fast, lightweight database aggregations at query time, without needing complex conversions on the fly.

---

## 4. Greedy Matchmaking Debt Solver

* **Context**: Group expense histories generate complex payment loops (e.g., Rohan owes Priya, Priya owes Aisha, Aisha owes Rohan).
* **Decision**: We implemented a greedy matchmaking algorithm to resolve group debts.
* **Rationale**:
  - The solver calculates each member's net position (Total Paid minus Total Owed) and separates them into a list of debtors (negative balances) and creditors (positive balances).
  - It sequentially matches the largest debtor with the largest creditor, resolving the maximum possible amount.
  - This guarantees that group debts are fully resolved using the absolute minimum number of payments (at most $N-1$ transactions, where $N$ is the number of members), making peer-to-peer settlements straightforward.

---

## 5. Centralized Expense Categories Module

* **Context**: Category selections were needed in both group expense entries and the private wallet ledger, along with filters and category analytics charts.
* **Decision**: Create a single reusable source of truth (`expenseCategories`) in a centralized module.
* **Rationale**:
  - Centralizing the categories prevents code duplication across different screens.
  - A unified list ensures that personal transaction records and group expense entries use the same naming standard.
  - Standardized classifications are essential for building accurate analytics reports and make the database schema cleaner.
  - This structured classification is ready for future integration of AI-driven budgeting recommendations.

---

## 6. Separating CSV Validation: Critical Errors vs. Warnings

* **Context**: CSV files imported by users often contain minor warnings (like potential duplicates) alongside severe errors (like negative values or bad formats).
* **Decision**: Separate validation checks into *Critical Errors* (immediate rejection) and *Warnings* (import as pending).
* **Rationale**:
  - Critical failures (e.g., negative amounts, invalid dates, unknown users) immediately reject the row to maintain system security.
  - Warning-level issues (e.g., potential duplicates, dates outside joining boundaries) are successfully imported but flagged as `PENDING` approval. This alerts group members in the UI for review. Pending items are skipped by the balance calculator until they are manually approved, protecting ledger balance integrity.
