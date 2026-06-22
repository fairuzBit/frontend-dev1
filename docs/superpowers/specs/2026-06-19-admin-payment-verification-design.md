# Admin Payment Verification Design

## 1. Context & Goal
The project currently simulates payments or relies on a payment gateway that isn't fully implemented. The user requested a manual verification workflow where a Learner's payment triggers an Admin verification process instead of automatically succeeding. 

## 2. Learner Workflow (Frontend)
1. In `LearnerBookingDetailPage`, the Learner selects a payment method and clicks **Selesaikan Pembayaran**.
2. The frontend calls `PATCH /api/learner/bookings/{id}/pay`.
3. Instead of showing an instant "Pembayaran Berhasil" (Paid) state, the UI will change to a **"Menunggu Verifikasi Admin"** (Awaiting Verification) state if the `payment_method` is set but the `payment_status` is still `unpaid`.
4. The Learner sees instructions to transfer to a specific Admin account and wait for manual approval.

## 3. Admin Workflow (Frontend)
1. **New Route & Page**: Create `/admin/payments` -> `AdminPaymentsPage.tsx`.
2. **UI Component**: A table listing all bookings that require payment verification. It fetches data from `GET /api/admin/payments`.
3. **Columns**: ID, Tanggal, Learner, Tutor, Metode, Nominal, Status.
4. **Action**: An "Approve" button that calls `PATCH /api/admin/payments/{id}/approve`.
5. **Post-Approval Flow**: 
   - Once approved, the backend updates the booking to `payment_status = paid` and `status = accepted`.
   - **For Learner**: The booking automatically moves to their **Jadwal Sesi Aktif** (Active Schedules) page since it is now fully confirmed.
   - **For Tutor**: The booking appears in their **Halaman Pesanan** (Bookings) so the Tutor is notified that a new paid session is ready to be conducted.

## 4. Backend Adjustments (If needed)
The backend `PaymentController` already exists and provides `index` and `approve` methods. We will utilize these existing endpoints. The `payBooking` in Learner's `BookingService` already sets `payment_method` and keeps `payment_status` as `unpaid`, which fits this manual workflow perfectly.

## 5. Aesthetics
- **Learner Page**: The "Menunggu Verifikasi" state will use an Amber/Orange color scheme (e.g., a clock icon instead of a green checkmark) to indicate a pending state.
- **Admin Page**: Clean, modern table matching the existing Admin Dashboard design (Navy headers, clear row borders, Emerald action buttons).
