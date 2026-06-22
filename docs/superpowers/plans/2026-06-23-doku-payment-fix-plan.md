# Implementation Plan - Resolving Doku Payment Checkout Mismatch

This plan outlines the steps required to implement the approved fix for Doku Sandbox Checkout generation failure.

## User Review Required

> [!IMPORTANT]
> The plan involves modifying `app/Services/Payment/DokuService.php` to use non-escaped slashes in `json_encode` and passing the raw JSON body to the POST request.

- **Proposed Change**: Change `json_encode($payload)` to `json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)` and send with `withBody($payloadJson, 'application/json')`.
- **Confidence Score**: 5/5

---

## Proposed Changes

### Backend

#### [DokuService.php](file:///home/airuzulfi/Projects/konekdin-midtrans-google/backend-dev1/app/Services/Payment/DokuService.php)
- Update JSON serialization of payload to prevent escaping forward slashes.
- Change the `Http::post()` call to send the exact computed JSON string as the raw request body.

```diff
-        $payloadJson = json_encode($payload);
+        $payloadJson = json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
         $digest = base64_encode(hash('sha256', $payloadJson, true));
 
         $signatureString = "Client-Id:" . $this->clientId . "\n" .
                            "Request-Id:" . $requestId . "\n" .
                            "Request-Timestamp:" . $timestamp . "\n" .
                            "Request-Target:" . $targetPath . "\n" .
                            "Digest:" . $digest;
 
         $signature = base64_encode(hash_hmac('sha256', $signatureString, $this->secretKey, true));
 
         $response = Http::withHeaders([
             'Client-Id' => $this->clientId,
             'Request-Id' => $requestId,
             'Request-Timestamp' => $timestamp,
             'Signature' => 'HMACSHA256=' . $signature,
             'Content-Type' => 'application/json',
             'Accept' => 'application/json',
-        ])->post($this->checkoutUrl, $payload);
+        ])->withBody($payloadJson, 'application/json')->post($this->checkoutUrl);
```

---

## Verification Plan

### Automated/Manual verification
1. Execute a payment request from the learner frontend dashboard or via a direct API request:
   - Call `PATCH /api/learner/bookings/17/pay` with body `{"payment_method": "doku"}`.
2. Confirm the response status is `200 OK` and returns the Doku Checkout URL (`payment.url`).
3. Check `laravel.log` to ensure no errors are logged.
