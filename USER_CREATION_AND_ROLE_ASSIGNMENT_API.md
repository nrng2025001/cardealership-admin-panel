# User Creation and Role Assignment API Documentation

## 📋 Overview

This document explains all API calls used to create users and assign roles in the Automotive Dashboard application.

---

## 🔧 Main API Endpoint

### **CREATE USER WITH ROLE**

**Endpoint:**
```
POST /api/auth/users/create-with-credentials
```

**Description:**
This single endpoint creates a new user in Firebase AND the backend database, and assigns them a role in one atomic operation.

**Request Headers:**
```
Authorization: Bearer <firebase-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "roleName": "CUSTOMER_ADVISOR"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "firebaseUid": "abc123xyz456...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": {
      "name": "CUSTOMER_ADVISOR",
      "permissions": {
        "canManageUsers": false,
        "canManageStocks": false,
        "canManageBookings": true,
        "canManageEnquiries": true,
        "canManageQuotations": true,
        "canBulkImport": false,
        "canViewAuditLogs": false
      }
    },
    "isActive": true,
    "dealershipId": null,
    "managerId": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Email already exists",
    "Password must be at least 8 characters"
  ]
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "message": "Unauthorized - Admin access required"
}
```

---

## 📊 Available Roles

| Role Name | Enum Value | Permissions |
|-----------|-----------|-------------|
| **Admin** | `ADMIN` | ⭐ Full access to everything |
| **General Manager** | `GENERAL_MANAGER` | 👔 Manage stocks, employees, view reports |
| **Sales Manager** | `SALES_MANAGER` | 📊 Manage team, bookings, enquiries |
| **Team Lead** | `TEAM_LEAD` | 👥 Manage bookings, enquiries for team |
| **Customer Advisor** | `CUSTOMER_ADVISOR` | 👤 Handle bookings, enquiries, quotations |

---

## 🔄 Role Mapping (Frontend ↔ Backend)

The frontend uses user-friendly names, while the backend uses enum constants:

| Frontend Display | Backend RoleName | Use In API |
|-----------------|------------------|------------|
| Admin | `ADMIN` | `ADMIN` |
| General Manager | `GENERAL_MANAGER` | `GENERAL_MANAGER` |
| Sales Manager | `SALES_MANAGER` | `SALES_MANAGER` |
| Team Lead | `TEAM_LEAD` | `TEAM_LEAD` |
| Advisor | `CUSTOMER_ADVISOR` | `CUSTOMER_ADVISOR` |

**TypeScript Type:**
```typescript
type RoleName = 
  | 'ADMIN'
  | 'GENERAL_MANAGER'
  | 'SALES_MANAGER'
  | 'TEAM_LEAD'
  | 'CUSTOMER_ADVISOR';

interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  roleName: RoleName;
}
```

---

## 🛠️ Additional User Management Endpoints

### **1. Update User Role**

**Endpoint:**
```
PUT /api/auth/users/{firebaseUid}/role
```

**Request Body:**
```json
{
  "roleName": "SALES_MANAGER"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Role updated successfully",
  "data": {
    "firebaseUid": "abc123...",
    "name": "John Doe",
    "role": {
      "name": "SALES_MANAGER",
      "permissions": {...}
    }
  }
}
```

---

### **2. Assign Manager**

**Endpoint:**
```
PUT /api/auth/users/{firebaseUid}/manager
```

**Request Body:**
```json
{
  "managerId": "manager-firebase-uid-123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Manager assigned successfully",
  "data": {
    "firebaseUid": "abc123...",
    "managerId": "manager-firebase-uid-123"
  }
}
```

---

### **3. Reset User Password**

**Endpoint:**
```
PUT /api/auth/users/{firebaseUid}/password
```

**Request Body:**
```json
{
  "newPassword": "NewSecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

### **4. Activate/Deactivate User**

**Activate:**
```
PUT /api/auth/users/{firebaseUid}/activate
```

**Deactivate:**
```
PUT /api/auth/users/{firebaseUid}/deactivate
```

**Response:**
```json
{
  "success": true,
  "message": "User activated successfully",
  "data": {
    "firebaseUid": "abc123...",
    "isActive": true
  }
}
```

---

### **5. Delete User**

**Endpoint:**
```
DELETE /api/auth/users/{firebaseUid}
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**⚠️ Warning:** This is a destructive operation and cannot be undone!

---

### **6. Get All Users**

**Endpoint:**
```
GET /api/auth/users?page=1&limit=20&role=CUSTOMER_ADVISOR&search=john
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `role` (optional): Filter by role name
- `search` (optional): Search by name or email
- `isActive` (optional): Filter by active status (true/false)
- `sortBy` (optional): Sort field (name, email, createdAt)
- `sortOrder` (optional): asc or desc

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "firebaseUid": "abc123...",
        "name": "John Doe",
        "email": "john@example.com",
        "role": {...},
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

---

## 📝 Frontend Implementation

### **From Employee Form:**

```typescript
// File: src/pages/employees/EmployeeForm.tsx

const handleSubmit = async (employeeData) => {
  // Frontend uses friendly role names
  const formData = {
    name: "John Doe",
    email: "john@example.com",
    password: "Password123",
    role: "Advisor",        // Frontend name
    department: "Sales",
    phone: "+1234567890",
    managerId: "manager-uid" // Optional
  };

  // API converts to backend role name
  await employeeAPI.createEmployee(formData);
};
```

### **From User Management Page:**

```typescript
// File: src/pages/admin/UserManagementPage.tsx

const handleCreateUser = async () => {
  // Directly uses backend role names
  const userRequest = {
    name: "Jane Smith",
    email: "jane@example.com",
    password: "SecurePass456",
    roleName: "SALES_MANAGER"  // Backend enum value
  };

  await employeeAPI.createUser(userRequest);
};
```

### **API Service Implementation:**

```typescript
// File: src/api/employees.ts

class EmployeeAPI {
  async createEmployee(employeeData) {
    // Map frontend role to backend role
    const userRequest = {
      name: employeeData.name,
      email: employeeData.email,
      password: employeeData.password,
      roleName: this.mapEmployeeRoleToRoleName(employeeData.role)
    };

    // Single API call creates user with role
    const response = await apiClient.post(
      '/auth/users/create-with-credentials',
      userRequest
    );

    // Optionally assign manager
    if (employeeData.managerId) {
      await this.assignManager(
        response.data.firebaseUid,
        employeeData.managerId
      );
    }

    return response;
  }

  private mapEmployeeRoleToRoleName(employeeRole: string): RoleName {
    const roleMap = {
      'Admin': 'ADMIN',
      'General Manager': 'GENERAL_MANAGER',
      'Sales Manager': 'SALES_MANAGER',
      'Team Lead': 'TEAM_LEAD',
      'Advisor': 'CUSTOMER_ADVISOR',
    };
    return roleMap[employeeRole] || 'CUSTOMER_ADVISOR';
  }
}
```

---

## 🔐 Authentication & Authorization

### **Required Permissions:**

| Endpoint | Required Role | Permission Check |
|----------|--------------|------------------|
| Create User | `ADMIN` | `canManageUsers` |
| Update Role | `ADMIN` | `canManageUsers` |
| Delete User | `ADMIN` | `canManageUsers` |
| Reset Password | `ADMIN` | `canManageUsers` |
| Get Users | `ADMIN`, `GENERAL_MANAGER` | `canManageUsers` or `canViewAuditLogs` |
| Assign Manager | `ADMIN`, `GENERAL_MANAGER` | `canManageEmployees` |

### **Authentication Header:**

All requests must include:
```
Authorization: Bearer <firebase-id-token>
```

The Firebase token is automatically refreshed and added by the API client interceptor:

```typescript
// File: src/api/client.ts
apiClient.interceptors.request.use(async (config) => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  
  if (currentUser) {
    const token = await currentUser.getIdToken(true);
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});
```

---

## 🧪 Testing Examples

### **Example 1: Create Admin User**

```bash
curl -X POST https://automotive-backend-frqe.onrender.com/api/auth/users/create-with-credentials \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "AdminPass123",
    "roleName": "ADMIN"
  }'
```

### **Example 2: Create Customer Advisor**

```bash
curl -X POST https://automotive-backend-frqe.onrender.com/api/auth/users/create-with-credentials \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Advisor",
    "email": "john@example.com",
    "password": "JohnPass123",
    "roleName": "CUSTOMER_ADVISOR"
  }'
```

### **Example 3: Update User Role**

```bash
curl -X PUT https://automotive-backend-frqe.onrender.com/api/auth/users/abc123xyz456/role \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roleName": "SALES_MANAGER"
  }'
```

### **Example 4: Assign Manager**

```bash
curl -X PUT https://automotive-backend-frqe.onrender.com/api/auth/users/abc123xyz456/manager \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "managerId": "manager-uid-789"
  }'
```

### **Example 5: Delete User**

```bash
curl -X DELETE https://automotive-backend-frqe.onrender.com/api/auth/users/abc123xyz456 \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

---

## ⚠️ Important Notes

### **Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)

### **Email Validation:**
- Must be unique
- Must be valid email format
- Cannot be changed after creation (Firebase limitation)

### **Role Assignment:**
- Role is assigned during user creation
- Can be updated later by admins
- Changing roles updates permissions immediately

### **Manager Assignment:**
- Optional field
- Can be assigned during creation or later
- Manager must be an existing user
- Used for hierarchy and reporting

### **User Deletion:**
- Permanently deletes user from Firebase and database
- Cannot delete yourself
- Cannot be undone
- Consider deactivating instead of deleting

---

## 📂 File Locations

| File | Description |
|------|-------------|
| `/src/api/employees.ts` | API service with all user management functions |
| `/src/api/types.ts` | TypeScript type definitions |
| `/src/api/client.ts` | Axios client with auth interceptor |
| `/src/pages/employees/EmployeesPage.tsx` | Employee management UI |
| `/src/pages/employees/EmployeeForm.tsx` | Employee creation form |
| `/src/pages/admin/UserManagementPage.tsx` | User management UI (admin only) |
| `/src/context/AuthContext.tsx` | Authentication and permission checks |

---

## 🎯 Quick Reference

**Create User:**
```
POST /api/auth/users/create-with-credentials
Body: { name, email, password, roleName }
```

**Update Role:**
```
PUT /api/auth/users/{uid}/role
Body: { roleName }
```

**Assign Manager:**
```
PUT /api/auth/users/{uid}/manager
Body: { managerId }
```

**Delete User:**
```
DELETE /api/auth/users/{uid}
```

**Get Users:**
```
GET /api/auth/users?page=1&limit=20
```

---

## 🔗 Related Documentation

- [Backend API Reference](./BACKEND_API_REFERENCE.md)
- [Employee Management Improvements](./EMPLOYEE_MANAGEMENT_IMPROVEMENTS.md)
- [Authentication Guide](./FIREBASE_SETUP_REQUIRED.md)
- [Integration Status](./INTEGRATION_STATUS.md)

---

**Last Updated:** 2024
**API Version:** v1
**Base URL:** `https://automotive-backend-frqe.onrender.com/api`

