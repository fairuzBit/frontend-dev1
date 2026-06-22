# Implementation Plan: Admin Navigation Tabs & Badge Indicators

We will implement the changes step-by-step to ensure complete correctness and validation at each stage.

## 1. Step-by-Step Task List

### [x] Step 1: Backend API Enhancement
- **File:** `app/Services/Admin/StatsService.php`
- **Change:**
  - Add query to calculate pending payment verifications:
    ```php
    $pendingPayments = Booking::whereNotNull('payment_method')
        ->where('status', 'pending')
        ->count();
    ```
  - Include `'pending_payments' => $pendingPayments` in the returned stats array.
- **Verification:** Run a simple curl or check stats endpoint to ensure it returns the new key correctly. (Completed)

### [x] Step 2: Create React Tabs Component
- **File:** `src/features/admin/components/AdminNavigationTabs.tsx`
- **Change:**
  - Import necessary hooks (`useEffect`, `useState`, `useLocation`, `Link`).
  - Add icons (`Users`, `ShieldCheck`, `Wallet`).
  - Add a polling effect that calls `/admin/stats` every 10 seconds to fetch `pending_verifications` and `pending_payments` count.
  - Implement Option A styles:
    - Active tab: `bg-white text-slate-800 border-x border-t border-slate-200 relative top-px`
    - Inactive tab: `bg-white/10 hover:bg-white/15 text-white border-transparent`
  - Inline red badges for pending counts:
    - Render a `span` with class `ml-2 px-1.5 py-0.5 text-[10px] font-extrabold text-white bg-rose-500 rounded-full min-w-5 h-5 flex items-center justify-center` if count > 0.
- **Verification:** Check TypeScript compilation. (Completed)

### [x] Step 3: Replace Hardcoded Tabs in Admin Pages
- **Files:**
  - `src/features/admin/pages/AdminUsersPage.tsx`
  - `src/features/admin/pages/AdminApplicationsPage.tsx`
  - `src/features/admin/pages/AdminPaymentsPage.tsx`
- **Change:**
  - Import `AdminNavigationTabs` from `@/features/admin/components/AdminNavigationTabs`.
  - Replace the current hardcoded `<div className="flex items-center gap-2 border-b border-slate-200 pb-px">...</div>` tabs section with `<AdminNavigationTabs />`.
- **Verification:** Build the project to confirm there are no import errors. (Completed)
