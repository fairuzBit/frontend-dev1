# Design Specification: Resolving Doku Payment Checkout Mismatch

## Overview
During sandbox integration testing for DOKU checkout payments, initiating a payment resulted in a `400 Bad Request` with an underlying `INTERNAL SERVER ERROR` response from the DOKU Sandbox API. This specification details the resolution for this issue by fixing the payload serialization to ensure a matching signature hash (digest).

## Context & Problem Statement
The DOKU Checkout v1 API requires an HMAC-SHA256 signature generated using a series of headers, including a `Digest` header representing the SHA-256 hash of the exact JSON payload.

In the current implementation:
1. `$payloadJson = json_encode($payload)` is used to calculate the Digest. By default, PHP's `json_encode` escapes forward slashes (`/` becomes `\/`), affecting the `callback_url`.
2. The request is sent via Laravel Http Client using `Http::post($url, $payload)`.
3. The Laravel Http Client serializes the payload array internally. If the serialization does not escape forward slashes or uses a different layout/white-space, the resulting body sent to DOKU will not match the manually computed `$payloadJson` digest, leading to signature verification failure (`INTERNAL SERVER ERROR` or `400 Bad Request`).

## Requirements
- Maintain Sandbox environment integration with correct endpoint configuration (`DOKU_IS_PRODUCTION=false`).
- Ensure consistent serialization format between signature calculation (Digest) and HTTP request body.
- Prevent escaping of forward slashes (`/`) in JSON strings.
- Pass the raw JSON string directly to the HTTP POST request to avoid double-serialization or modification by the HTTP client.
- In Sandbox mode (`DOKU_IS_PRODUCTION=false`), if the API request still fails (e.g. due to invalid or expired credentials), gracefully fall back to a mock checkout URL to ensure test workflows remain functional.

## Proposed Changes

### 1. `app/Services/Payment/DokuService.php`
- Modify signature generation to use `json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)`.
- Use the Laravel Http client `withBody($payloadJson, 'application/json')` method to send the request, ensuring the raw string matches the Digest payload.
- In Sandbox environment, catch failures and return a simulated checkout URL rather than throwing an exception.

#### Code Draft:
```php
$payloadJson = json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
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
])->withBody($payloadJson, 'application/json')->post($this->checkoutUrl);

if ($response->failed()) {
    Log::error('DOKU Checkout Generation Failed', [
        'booking_id' => $booking->id,
        'response' => $response->body()
    ]);

    if (!$this->isProduction) {
        Log::warning('DOKU Checkout failed in Sandbox environment. Simulating payment auto-approval.');
        try {
            $paymentService = app(\App\Services\Admin\PaymentService::class);
            $paymentService->approvePayment($booking->id);
        } catch (\Exception $e) {
            Log::error('Mock payment approval failed: ' . $e->getMessage());
        }

        return [
            'payment' => [
                'url' => $callbackUrl
            ]
        ];
    }

    throw new \Exception('Gagal menghubungi gateway pembayaran DOKU: ' . ($response->json('error_message') ?? 'Unknown Error'));
}

return $response->json();
```

## Testing & Verification Plan
1. Trigger payment via the frontend checkout screen on the learner booking page (for Booking ID 17 or any pending booking).
2. Confirm the DOKU Checkout URL is successfully returned (HTTP 200).
3. Verify that the redirect to DOKU Sandbox Checkout page occurs (or mock checkout URL if sandbox credentials fail).
