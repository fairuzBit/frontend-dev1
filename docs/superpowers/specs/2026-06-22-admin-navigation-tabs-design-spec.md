# Design Spec: Admin Navigation Tabs & Badge Indicators

This specification details the enhancements to the Admin Navigation Tabs inside the KonekDin Admin Panel. It addresses readability issues in the light/dark mode and adds a notification system to show pending counts for "Verifikasi Tutor" and "Manajemen Keuangan" tabs.

## 1. Problem Statement
* **Readability:** The Admin navigation tabs currently have transparent backgrounds when inactive. This makes them extremely difficult to read against the dark gradient header.
* **Lack of Visibility:** Admins cannot see how many items require their approval/verification (such as new tutor applications or pending payments) unless they navigate to each page.

---

## 2. Proposed Changes

### A. Backend enhancements (API)
We will modify `/api/admin/stats` to calculate the count of pending payment verifications.
* **Model:** `Booking`
* **Condition:** `Booking::whereNotNull('payment_method')->where('status', 'pending')->count()`
* **Key:** `pending_payments` will be added to the JSON response of `StatsService.php`.

### B. Frontend enhancements
* **New Shared Component:** `AdminNavigationTabs.tsx`
  - Encapsulates the three tabs: "Manajemen Pengguna", "Verifikasi Tutor", and "Manajemen Keuangan".
  - Uses polling (every 10 seconds) on the `/admin/stats` endpoint to keep the pending counts up to date.
  - Automatically identifies the active tab using the current URL (`useLocation`).
* **Visual Styling (Option A):**
  - **Active Tab:** White background (`bg-white`), dark text (`text-slate-800`), bordered.
  - **Inactive Tab:** Semi-transparent dark background (`bg-white/10 hover:bg-white/15`), white text (`text-white`), smooth transition.
* **Notification Badges:**
  - Standard red/rose round badges (`bg-rose-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full`).
  - Rendered inline next to the tab label if the count is greater than 0:
    - "Verifikasi Tutor" badge count maps to `pending_verifications`.
    - "Manajemen Keuangan" badge count maps to `pending_payments`.

---

## 3. Implementation Plan

### Step 1: Backend Update
- Edit `app/Services/Admin/StatsService.php` to calculate and return `pending_payments`.

### Step 2: Create Shared Tabs Component
- Create `src/features/admin/components/AdminNavigationTabs.tsx`.
- Add stats polling state, loading state, and render tab buttons.

### Step 3: Replace Hardcoded Tabs in Admin Pages
- Update `src/features/admin/pages/AdminUsersPage.tsx`.
- Update `src/features/admin/pages/AdminApplicationsPage.tsx`.
- Update `src/features/admin/pages/AdminPaymentsPage.tsx`.
