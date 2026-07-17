# API Documentation: [Service Name]

* **Base URL**: `https://api.domain.com/v1`
* **Format**: JSON (UTF-8)

---

## 🔐 Authentication

All requests must include the following Authorization header:
```http
Authorization: Bearer <API_KEY>
```

---

## 🚀 Endpoints

### 1. Get Resource List
- **HTTP Method**: `GET`
- **Path**: `/resources`
- **Query Parameters**:
  - `limit` (optional): Number of records (default: 20)
  - `offset` (optional): Offset starting point (default: 0)

#### Request Example
```http
GET /v1/resources?limit=2 HTTP/1.1
Host: api.domain.com
Authorization: Bearer key_test_123
```

#### Response Example (200 OK)
```json
{
  "object": "list",
  "data": [
    {
      "id": "res_981a",
      "name": "Primary Database Cluster",
      "status": "active"
    }
  ],
  "has_more": false
}
```

---

## ❌ Error Codes

| HTTP Status | Error Type | Description |
|---|---|---|
| 400 | `bad_request` | The request was unacceptable, often due to missing a required parameter. |
| 401 | `unauthorized` | No valid API key provided. |
| 404 | `not_found` | The requested resource doesn't exist. |
| 500 | `internal_error` | Something went wrong on our servers. |
