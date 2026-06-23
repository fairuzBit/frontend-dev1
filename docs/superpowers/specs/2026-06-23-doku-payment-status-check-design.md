# Design Specification: DOKU Payment Status Check Integration

## Overview
This specification details the implementation of a manual and automated payment status verification workflow for KonekDin using the DOKU Check Status API (`GET /orders/v1/status/{invoice_number}`). This logic is adapted from the Node.js implementation provided in `doku_payment_nodejs` and integrated into the Laravel backend.

## Context & Problem Statement
Currently, booking payments rely on DOKU Hosted Checkout callbacks (webhooks) or manual admin verification. If a webhook fails to deliver due to network or tunnel issues, the booking remains in `unpaid` status.
To solve this, we will implement a direct API call to DOKU's Check Status endpoint when a learner views their booking details, automatically updating the payment state if the transaction is completed on DOKU.

## Proposed Changes

### 1. Database & Serialization (`payment_code`)
Since the database does not have an `invoice_number` column, we will store the generated invoice number alongside the checkout URL in the `payment_code` column using a delimiter (`:::`):
- Value: `<checkout_url>:::<invoice_number>`
- The frontend will only receive the `<checkout_url>` via the `BookingResource` layer, maintaining complete backward compatibility.

### 2. `app/Http/Resources/BookingResource.php`
- Modify `payment_code` output to return only the checkout URL if a delimiter is present.

### 3. `app/Services/Payment/DokuService.php`
- Update `createCheckoutUrl` to return both the payment URL and the generated `invoice_number`.
- Add `checkPaymentStatus($invoiceNumber)` using the signature algorithm from `cek_payment.js` (omitting `Digest` since it is a `GET` request).
- In Sandbox environment, fallback to returning `SUCCESS` if the API request fails.

### 4. `app/Services/Learner/BookingService.php`
- Modify `payBooking` to format and store the `payment_code` as `<url>:::<invoice_number>`.
- Modify `getBookingDetail` to extract the `invoice_number`, check the status via `DokuService->checkPaymentStatus`, and call `PaymentService->approvePayment` if the transaction is successful.

## Code Drafts

### signature for GET Request in `DokuService.php`
```php
public function checkPaymentStatus($invoiceNumber)
{
    if (empty($this->clientId) || empty($this->secretKey)) {
        return ['transaction' => ['status' => 'SUCCESS']];
    }

    $timestamp = gmdate('Y-m-d\TH:i:s\Z');
    $requestId = (string) Str::uuid();
    $targetPath = '/orders/v1/status/' . $invoiceNumber;
    
    $baseUrl = $this->isProduction ? 'https://api.doku.com' : 'https://api-sandbox.doku.com';
    $statusUrl = $baseUrl . $targetPath;

    $signatureString = "Client-Id:" . $this->clientId . "\n" .
                       "Request-Id:" . $requestId . "\n" .
                       "Request-Timestamp:" . $timestamp . "\n" .
                       "Request-Target:" . $targetPath;

    $signature = base64_encode(hash_hmac('sha256', $signatureString, $this->secretKey, true));

    $response = Http::withHeaders([
        'Client-Id' => $this->clientId,
        'Request-Id' => $requestId,
        'Request-Timestamp' => $timestamp,
        'Signature' => 'HMACSHA256=' . $signature,
    ])->get($statusUrl);

    if ($response->failed()) {
        if (!$this->isProduction) {
            return ['transaction' => ['status' => 'SUCCESS']];
        }
        throw new \Exception('Failed to check status');
    }

    return $response->json();
}
```
