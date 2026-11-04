# Feature: Prepare payment details

## 1. User goal
A pet owner wants to see which pet service they selected and the exact amount to pay, so they can check the details before any payment is made.

## 2. Scope
- The feature looks up one service from a mock catalogue and returns its payment details as JSON.
- The server decides the price from the catalogue.
- It does NOT charge money, connect to a payment gateway, create database tables or add EJS pages.
- No login is required for this classroom mock endpoint.

## 3. Request
- Method and URL: `GET /payments/prepare/:serviceId`
- Input: the service ID in the URL path (for example `/payments/prepare/1`).
- Any amount sent by the client (for example `?amount=1`) is ignored.

## 4. Service catalogue
| ID (number) | Service name (string) | Price (number) |
|---|---|---|
| 1 | Vaccination | 35 |
| 2 | Pet Grooming | 50 |
| 3 | Boarding | 80 |

## 5. Successful response
- HTTP status: 200
- JSON body with exactly five fields:
  - `serviceId` (number), e.g. 1
  - `serviceName` (string), e.g. "Vaccination"
  - `amount` (number), e.g. 35 (not the string "35.00")
  - `currency` (string), always "sgd"
  - `status` (string), always "READY_FOR_PAYMENT"

Example:
```json
{
  "serviceId": 1,
  "serviceName": "Vaccination",
  "amount": 35,
  "currency": "sgd",
  "status": "READY_FOR_PAYMENT"
}
```

## 6. Unsuccessful response
- If the service ID is not in the catalogue, return HTTP 404 with:
```json
{ "error": "Service not found" }
```

## 7. Acceptance criteria
- AC1: `GET /payments/prepare/1` returns 200 with serviceName "Vaccination" and amount 35.
- AC2: `GET /payments/prepare/2` returns 200 with serviceName "Pet Grooming" and amount 50.
- AC3: `GET /payments/prepare/3` returns 200 with serviceName "Boarding" and amount 80.
- AC4: `GET /payments/prepare/999` returns 404 with `{"error":"Service not found"}`.
- AC5: Every successful response has exactly five fields; serviceId and amount are numbers, the others are strings; currency is "sgd" and status is "READY_FOR_PAYMENT".

## 8. Open questions
- Should a non-numeric ID (e.g. `/payments/prepare/abc`) return 400 Bad Request instead of 404? Not agreed yet; it currently returns 404.
- Should IDs such as `01` or `1.0` be accepted as service 1? Not agreed yet; they currently return service 1.
- Should the endpoint require login and link the payment to a specific pet in a later lesson? Not agreed yet.
