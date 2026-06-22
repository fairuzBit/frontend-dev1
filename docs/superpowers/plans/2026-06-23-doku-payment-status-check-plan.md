# Implementation Plan - DOKU Payment Status Check Integration

This plan outlines the steps required to implement the status check API for DOKU payment integration in Laravel.

## Proposed Changes

### Backend

#### [DokuService.php](file:///home/airuzulfi/Projects/konekdin-midtrans-google/backend-dev1/app/Services/Payment/DokuService.php)
- Update `createCheckoutUrl` to return both checkout URL and `invoice_number`.
- Add `checkPaymentStatus($invoiceNumber)` using the `GET /orders/v1/status/{invoice_number}` endpoint.

#### [BookingResource.php](file:///home/airuzulfi/Projects/konekdin-midtrans-google/backend-dev1/app/Http/Resources/BookingResource.php)
- Strip the `invoice_number` suffix from `payment_code` before returning it in the API output.

#### [BookingService.php](file:///home/airuzulfi/Projects/konekdin-midtrans-google/backend-dev1/app/Services/Learner/BookingService.php)
- Update `payBooking` to format `payment_code` as `url:::invoice_number`.
- Update `getBookingDetail` to query Doku status API if the booking is unpaid, and automatically update database status if paid/failed on Doku.

---

## Verification Plan

### Automated/Manual Verification
1. Create a new booking and request payment URL via `PATCH /api/learner/bookings/{id}/pay`.
2. Verify that `payment_code` in the database is formatted as `<url>:::<invoice_number>`, but the API response only returns `<url>`.
3. Force a status check request by calling `GET /api/learner/bookings/{id}`.
4. Verify that `laravel.log` shows the status check executing, and the booking updates to `paid` if Doku status API mock returns success.
