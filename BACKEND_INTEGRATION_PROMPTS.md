# Backend Integration Prompts - Production Ready

## 🚗 MULTI-DEALERSHIP FEATURE - BACKEND INTEGRATION

### Overview
Implement comprehensive multi-dealership support with vehicle catalog management, allowing each dealership to configure their specific inventory, models, variants, and pricing.

---

## 📋 PROMPT 1: Multi-Dealership Setup & Onboarding

### Requirements

#### 1. Dealership Entity
Create a `Dealership` model/table with the following fields:

```typescript
interface Dealership {
  id: string;                    // UUID
  name: string;                  // e.g., "Mumbai Tata Motors"
  code: string;                  // Unique code: e.g., "TATA-MUM-001"
  type: 'TATA' | 'UNIVERSAL';    // Dealership type
  
  // Contact Information
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  
  // Business Details
  gstNumber: string;
  panNumber: string;
  
  // Car Brands Sold
  brands: string[];              // e.g., ["TATA", "Mahindra", "Hyundai"]
  
  // Status
  isActive: boolean;
  onboardingCompleted: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

#### 2. Vehicle Catalog Entity
Create a `VehicleCatalog` model for dealership-specific vehicle configurations:

```typescript
interface VehicleCatalog {
  id: string;
  dealershipId: string;          // Foreign key to Dealership
  
  // Vehicle Details
  brand: string;                 // e.g., "TATA"
  model: string;                 // e.g., "Nexon"
  
  // Variants Configuration
  variants: VehicleVariant[];
  
  // Status
  isActive: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

interface VehicleVariant {
  id: string;
  name: string;                  // e.g., "XZ+ Lux"
  vcCode: string;                // Variant code
  
  // Technical Specifications
  fuelTypes: string[];           // e.g., ["Petrol", "Diesel", "Electric"]
  transmissions: string[];       // e.g., ["Manual", "Automatic", "AMT"]
  colors: VehicleColor[];
  
  // Pricing
  exShowroomPrice: number;
  rtoCharges: number;
  insurance: number;
  accessories: number;
  onRoadPrice: number;
  
  // Availability
  isAvailable: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

interface VehicleColor {
  name: string;                  // e.g., "Flame Red"
  code: string;                  // e.g., "FR-001"
  additionalCost: number;        // Extra cost for this color
  isAvailable: boolean;
}
```

---

### API Endpoints Required

#### 1. Dealership Management

**POST /api/dealerships**
- Create new dealership (admin only)
- Request body: Dealership creation data
- Response: Created dealership with ID

**GET /api/dealerships**
- List all dealerships (with pagination, filters)
- Query params: `?page=1&limit=10&type=TATA&isActive=true`
- Response: Paginated list of dealerships

**GET /api/dealerships/:id**
- Get specific dealership details
- Response: Full dealership data

**PATCH /api/dealerships/:id**
- Update dealership information
- Request body: Partial dealership data
- Response: Updated dealership

**POST /api/dealerships/:id/complete-onboarding**
- Mark onboarding as complete
- Response: Updated dealership with onboardingCompleted = true

**GET /api/dealerships/:id/catalog**
- Get vehicle catalog for specific dealership
- Response: List of all vehicle models and variants

---

#### 2. Vehicle Catalog Management

**POST /api/dealerships/:dealershipId/catalog**
- Add vehicle model to dealership catalog
- Request body:
```json
{
  "brand": "TATA",
  "model": "Nexon",
  "variants": [
    {
      "name": "XZ+",
      "vcCode": "NXN-XZ-001",
      "fuelTypes": ["Petrol", "Diesel"],
      "transmissions": ["Manual", "Automatic"],
      "colors": [
        {
          "name": "Flame Red",
          "code": "FR-001",
          "additionalCost": 0,
          "isAvailable": true
        }
      ],
      "exShowroomPrice": 1149000,
      "rtoCharges": 85000,
      "insurance": 45000,
      "accessories": 15000,
      "onRoadPrice": 1294000
    }
  ]
}
```
- Response: Created vehicle catalog entry

**GET /api/dealerships/:dealershipId/catalog/brands**
- Get all brands sold by this dealership
- Response: `["TATA", "Mahindra"]`

**GET /api/dealerships/:dealershipId/catalog/models?brand=TATA**
- Get all models for a specific brand
- Response: `["Nexon", "Harrier", "Safari", "Punch"]`

**GET /api/dealerships/:dealershipId/catalog/:modelId/variants**
- Get all variants for a specific model
- Response: Full variant details with pricing and availability

**PATCH /api/dealerships/:dealershipId/catalog/:catalogId**
- Update vehicle catalog entry
- Request body: Partial catalog data
- Response: Updated catalog

**DELETE /api/dealerships/:dealershipId/catalog/:catalogId**
- Remove vehicle from catalog (soft delete)
- Response: Success confirmation

---

#### 3. User-Dealership Association

**PATCH /api/auth/users/:userId**
- Update user's dealership association
- Request body:
```json
{
  "dealershipId": "dealer-uuid-here"
}
```
- Response: Updated user with dealership link

**GET /api/auth/users?dealershipId=xyz**
- Get all users for a specific dealership
- Response: List of users (employees) for that dealership

---

### Database Schema Changes

#### 1. Add `dealershipId` to existing tables:

```sql
-- Add to users table
ALTER TABLE users ADD COLUMN dealership_id VARCHAR(255);
ALTER TABLE users ADD CONSTRAINT fk_users_dealership 
  FOREIGN KEY (dealership_id) REFERENCES dealerships(id);

-- Add to bookings table
ALTER TABLE bookings ADD COLUMN dealership_id VARCHAR(255);
ALTER TABLE bookings ADD CONSTRAINT fk_bookings_dealership 
  FOREIGN KEY (dealership_id) REFERENCES dealerships(id);

-- Add to enquiries table
ALTER TABLE enquiries ADD COLUMN dealership_id VARCHAR(255);
ALTER TABLE enquiries ADD CONSTRAINT fk_enquiries_dealership 
  FOREIGN KEY (dealership_id) REFERENCES dealerships(id);

-- Add to quotations table
ALTER TABLE quotations ADD COLUMN dealership_id VARCHAR(255);
ALTER TABLE quotations ADD CONSTRAINT fk_quotations_dealership 
  FOREIGN KEY (dealership_id) REFERENCES dealerships(id);

-- Add to stock/vehicles table
ALTER TABLE vehicles ADD COLUMN dealership_id VARCHAR(255);
ALTER TABLE vehicles ADD CONSTRAINT fk_vehicles_dealership 
  FOREIGN KEY (dealership_id) REFERENCES dealerships(id);
```

---

### Middleware Required

#### Dealership Context Middleware
```typescript
// Extract dealership from authenticated user
// Attach to request for all API calls
// Ensure users only see data from their dealership

middleware.dealershipContext = async (req, res, next) => {
  const user = req.user; // From auth middleware
  
  if (!user.dealershipId && !user.isSystemAdmin) {
    return res.status(403).json({
      success: false,
      message: 'User must be associated with a dealership'
    });
  }
  
  req.dealership = await Dealership.findById(user.dealershipId);
  next();
};
```

---

### Data Isolation Rules

1. **System Admin** - Can see ALL dealerships and ALL data
2. **Dealership Admin** - Can see only their dealership's data
3. **Employees** - Can see only their dealership's data
4. All queries must be filtered by `dealershipId` (except system admin)

---

### Migration Strategy

1. Create `dealerships` table
2. Create `vehicle_catalogs` table
3. Add `dealership_id` column to existing tables
4. Create a default dealership for existing data
5. Migrate existing data to default dealership
6. Update all API endpoints to filter by dealership

---

## 📋 PROMPT 2: Enhanced Role System

### Requirements

Add `SALES_MANAGER` role with proper permissions:

```typescript
enum RoleName {
  ADMIN = 'ADMIN',
  GENERAL_MANAGER = 'GENERAL_MANAGER',
  SALES_MANAGER = 'SALES_MANAGER',      // NEW
  TEAM_LEAD = 'TEAM_LEAD',
  CUSTOMER_ADVISOR = 'CUSTOMER_ADVISOR'
}

// Sales Manager Permissions:
const SALES_MANAGER_PERMISSIONS = {
  canViewDashboard: true,
  canManageEnquiries: true,
  canManageQuotations: true,
  canManageBookings: true,
  canViewStocks: true,
  canManageStocks: true,              // Can update stock status
  canViewEmployees: true,
  canManageAdvisors: true,            // Can manage advisors and team leads
  canViewReports: true,
  canApproveQuotations: true,
  canAssignLeads: true,
  
  // Cannot do:
  canManageAdmins: false,
  canManageDealership: false,
  canBulkImport: false,
  canDeleteData: false,
};
```

---

## 📋 PROMPT 3: Complete Implementation Checklist

### Backend Tasks

- [ ] Create `Dealership` model with all fields
- [ ] Create `VehicleCatalog` model with variants and colors
- [ ] Add `dealershipId` to: users, bookings, enquiries, quotations, vehicles
- [ ] Implement all dealership CRUD endpoints
- [ ] Implement vehicle catalog CRUD endpoints
- [ ] Add `SALES_MANAGER` role to roles table
- [ ] Create dealership context middleware
- [ ] Update all existing endpoints to filter by dealership
- [ ] Add seed data for sample dealership with catalog
- [ ] Update authentication to include dealership in user profile
- [ ] Add validation for dealership-user association
- [ ] Implement dealership-scoped statistics endpoints

---

## 🔧 Sample API Responses

### Dealership Profile Response
```json
{
  "success": true,
  "data": {
    "dealership": {
      "id": "deal-001",
      "name": "Mumbai Tata Motors",
      "code": "TATA-MUM-001",
      "type": "TATA",
      "brands": ["TATA"],
      "onboardingCompleted": true,
      "catalog": [
        {
          "brand": "TATA",
          "model": "Nexon",
          "variants": [
            {
              "name": "XZ+ Lux",
              "vcCode": "NXN-XZ-LUX",
              "fuelTypes": ["Petrol", "Diesel", "Electric"],
              "transmissions": ["Manual", "Automatic"],
              "colors": [
                {"name": "Flame Red", "code": "FR", "additionalCost": 0},
                {"name": "Daytona Grey", "code": "DG", "additionalCost": 5000}
              ],
              "exShowroomPrice": 1149000,
              "onRoadPrice": 1294000
            }
          ]
        }
      ]
    }
  }
}
```

---

## 🎯 Priority Order

1. **HIGH**: Add `dealershipId` to all tables and filter all queries
2. **HIGH**: Create dealership CRUD endpoints
3. **HIGH**: Add `SALES_MANAGER` role
4. **MEDIUM**: Implement vehicle catalog management
5. **MEDIUM**: Add dealership context middleware
6. **LOW**: Seed data and migration scripts

---

## 📞 Next Steps

**Send this prompt to your backend developer:**
> "Please implement multi-dealership support as per BACKEND_INTEGRATION_PROMPTS.md. Priority: Add dealershipId to all tables, create dealership CRUD endpoints, add SALES_MANAGER role, and implement dealership context middleware for data isolation."

**Once backend is ready, I'll integrate the frontend.**

