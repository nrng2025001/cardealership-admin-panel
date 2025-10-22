# Backend API Reference - Quick Reference

## 🔗 Base URL
```
http://10.69.245.247:4000/api
```

## 🔐 Authentication
All requests (except login) require Bearer token:
```
Authorization: Bearer <firebase-id-token>
```

---

## 📋 API Endpoints Summary

### Authentication
```
POST   /auth/login                              # Login (public)
GET    /auth/users                              # List users (Admin/GM)
POST   /auth/users/create-with-credentials      # Create user (Admin)
PUT    /auth/users/:uid/role                    # Update role (Admin)
PUT    /auth/users/:uid/password                # Reset password (Admin)
PUT    /auth/users/:uid/activate                # Activate user (Admin)
PUT    /auth/users/:uid/deactivate              # Deactivate user (Admin)
DELETE /auth/users/:uid                         # Delete user (Admin)
```

### Bookings
```
GET    /bookings                                # List bookings
GET    /bookings/:id                            # Get booking
POST   /bookings                                # Create booking
PUT    /bookings/:id                            # Update booking
DELETE /bookings/:id                            # Delete booking
PATCH  /bookings/:id/assign                     # Assign advisor
GET    /bookings/:id/audit                      # Audit log

# Bulk Import
POST   /bookings/import/upload                  # Upload file
POST   /bookings/import/preview                 # Preview import
GET    /bookings/imports                        # Import history
GET    /bookings/imports/:id/errors             # Download errors
```

### Enquiries
```
GET    /enquiries                               # List enquiries
GET    /enquiries/:id                           # Get enquiry
GET    /enquiries/stats                         # Statistics (Admin)
POST   /enquiries                               # Create enquiry
PUT    /enquiries/:id                           # Update enquiry
PATCH  /enquiries/:id                           # Update category/status
DELETE /enquiries/:id                           # Delete enquiry
```

### Quotations
```
GET    /quotations                              # List quotations
GET    /quotations/:id                          # Get quotation
GET    /quotations/stats                        # Statistics (Admin)
POST   /quotations                              # Create quotation
PUT    /quotations/:id                          # Update quotation
PATCH  /quotations/:id                          # Update status
DELETE /quotations/:id                          # Delete quotation
```

### Stock/Vehicles
```
GET    /stock                                   # List vehicles
GET    /stock/:id                               # Get vehicle
POST   /stock                                   # Create vehicle (Admin/GM/SM)
PUT    /stock/:id                               # Update vehicle (Admin/GM/SM)
PATCH  /stock/:id                               # Toggle status
DELETE /stock/:id                               # Delete vehicle (Admin)
```

---

## 🎯 Quick Examples

### Login
```javascript
POST /api/auth/login
{
  "email": "admin@test.com",
  "password": "testpassword123"
}

Response:
{
  "success": true,
  "data": {
    "token": "firebase-token",
    "user": { ... },
    "tokenType": "custom"
  }
}
```

### Create User
```javascript
POST /api/auth/users/create-with-credentials
Headers: { Authorization: Bearer <token> }
{
  "name": "New Advisor",
  "email": "advisor@test.com",
  "password": "SecurePass123!",
  "roleName": "CUSTOMER_ADVISOR"
}
```

### Upload Bulk Bookings
```javascript
POST /api/bookings/import/upload
Headers: { Authorization: Bearer <token> }
Content-Type: multipart/form-data
FormData: {
  file: <excel-file>,
  dealerCode: "TATA001"
}
```

### Get Bookings with Filters
```javascript
GET /api/bookings?page=1&limit=20&status=PENDING&dealerCode=TATA001
Headers: { Authorization: Bearer <token> }
```

---

## 📊 Data Types

### Booking Status
- `PENDING`
- `CONFIRMED`
- `DELIVERED`
- `CANCELLED`

### Enquiry Category
- `HOT`
- `LOST`
- `BOOKED`

### Enquiry Status
- `OPEN`
- `CLOSED`

### Quotation Status
- `PENDING`
- `APPROVED`
- `REJECTED`
- `SENT_TO_CUSTOMER`

### Stock Availability
- `VEHICLE_AVAILABLE`
- `IN_TRANSIT`
- `ORDER_PLACED`
- `NOT_AVAILABLE`

### User Roles
- `ADMIN`
- `GENERAL_MANAGER`
- `SALES_MANAGER`
- `TEAM_LEAD`
- `CUSTOMER_ADVISOR`

---

## 🔍 Pagination

All list endpoints support pagination:
```
?page=1&limit=20&sortBy=createdAt&sortOrder=desc
```

Response format:
```json
{
  "success": true,
  "data": {
    "bookings": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "totalPages": 8
    }
  }
}
```

---

## ✅ Test Credentials

```
Email: admin@test.com
Password: testpassword123
Role: ADMIN
```

---

For full integration details, see [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)

