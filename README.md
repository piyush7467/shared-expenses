# MoneyMap Frontend Web Client

Welcome to the front-end code for **MoneyMap**! This client is a single-page application built using **React** powered by **Vite** for fast hot module reloading and build speeds. 

We used **Tailwind CSS** to build a modern, glassmorphic user interface. The UI features smooth transitions, responsive dashboard charts, theme toggles, and a collapsible navigation drawer that adjusts to desktop monitors, tablets, and mobile phones.

---

## Centralized Expense Categories Integration

The front-end client makes extensive use of the centralized **Expense Categories Module**. 

Instead of hardcoding category lists inside the split forms, transaction lists, wallet summaries, and filter drop-downs, the application references a single, centralized list of categories.

### Key Integration Points:
* **Expense Dropdown Selection**: The application imports the reusable `expenseCategories` configuration list and passes it directly to the `<ExpenseDropdown />` component. This guarantees that whenever a user records a new bill in a group or logs a personal expense, they pick from a consistent list of 17 standard categories.
* **Wallet Filters**: The personal finance workspace ("My Wallet") maps over the exact same categories to generate filter pills and populate search criteria dynamically.
* **Visual Analytics**: The category names act as stable keys when compiling split datasets for visual charts (like category-wise pie charts and monthly budgets), ensuring that data is matched and styled correctly.

---

## App Features & Capabilities

* **Modern Design System**: Fully theme-aware components that support Light and Dark modes. We avoided static white or dark overrides so that all cards, tables, menus, and text adapt smoothly when toggled.
* **Mobile-Responsive Navigation**: The main navbar uses a collapsible side-drawer for mobile devices, triggered by a hamburger button. This makes it easy to manage balances on the go.
* **Optimized Loading States**: We replaced full-page spinners with inline skeleton loading states inside the dashboard and wallet pages, ensuring content loads smoothly without visual jumps.
* **Anomalies and Verification Flow**: Interactive warning cards appear in the UI for CSV imports marked as `PENDING`, allowing group members to review and approve them in a single click.

---

## Getting Started

### 1. Installation
Navigate to the frontend folder and install the node dependencies:
```bash
cd frontend
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root of the `frontend/` folder. This tells the client where to find the running Express server:
```env
VITE_API_URL="http://localhost:5000/api"
```
*(When deploying to Vercel, update this environment variable to point to your live backend domain, e.g., `https://moneymap-backend.vercel.app/api`)*

### 3. Local Development Run
Start the Vite local development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your web browser.

### 4. Building for Production
To generate a production-ready build bundle (stored in the `/dist` directory):
```bash
npm run build
```
You can preview the production bundle locally with:
```bash
npm run preview
```
