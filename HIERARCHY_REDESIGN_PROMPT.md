# Hierarchy Management - Redesign Specification

## 🎯 Current Problems

1. **Not Intuitive:** Hard to understand reporting structure at a glance
2. **Missing Sales Manager:** No clear Sales Manager designation in UI
3. **Poor Visual Hierarchy:** Difficult to see who reports to whom
4. **No Drag-and-Drop:** Cannot easily reassign managers
5. **Limited Information:** Doesn't show key metrics for each employee

---

## ✨ New Design Requirements

### Visual Structure

#### **Org Chart View (Primary)**
```
┌─────────────────────────────────────┐
│        General Manager              │
│    ┌─────────────────────┐         │
│    │  Rajesh Kumar       │         │
│    │  📧 rajesh@...      │         │
│    │  👥 12 Reports      │         │
│    └─────────────────────┘         │
└──────────┬──────────────────────────┘
           │
    ┌──────┴──────┬──────────┬────────┐
    │             │          │        │
┌───▼────┐   ┌───▼────┐ ┌───▼────┐   │
│ SM-1   │   │ SM-2   │ │ SM-3   │   │
│ Priya  │   │ Amit   │ │ Neha   │   │
│ 6 rpts │   │ 4 rpts │ │ 2 rpts │   │
└───┬────┘   └───┬────┘ └────────┘   │
    │            │                    │
┌───▼────┐   ┌──▼─────┐             │
│ TL-1   │   │ TL-2   │             │
│ Vikram │   │ Sneha  │             │
│ 3 rpts │   │ 2 rpts │             │
└───┬────┘   └───┬────┘             │
    │            │                    │
┌───▼────────────▼───────────────────▼──┐
│       Customer Advisors (15)         │
└──────────────────────────────────────┘
```

---

## 🎨 UI Components Needed

### 1. Org Chart Card Component
```typescript
interface OrgCardProps {
  employee: Employee;
  level: number;                    // Hierarchy depth (0 = GM, 1 = SM, etc.)
  subordinates: Employee[];
  onEditManager: (employee: Employee) => void;
  onViewDetails: (employee: Employee) => void;
}

Features:
- Avatar with initials
- Name and role badge
- Email and phone (collapsible)
- Direct reports count
- Performance indicators (optional)
- Edit manager button (admin only)
- Hover tooltip with full details
```

### 2. Role-Based Filtering
```typescript
Tabs:
- All Employees (tree view)
- General Managers
- Sales Managers          // NEW
- Team Leads
- Customer Advisors
```

### 3. Search & Filter Bar
```
[🔍 Search]  [Filter by Role ▼]  [Filter by Manager ▼]  [Status: Active ▼]
```

### 4. Quick Stats Panel
```
┌──────────────────────────────────────┐
│  Total Employees: 42                 │
│  General Managers: 1                 │
│  Sales Managers: 3     // NEW        │
│  Team Leads: 8                       │
│  Advisors: 30                        │
└──────────────────────────────────────┘
```

---

## 🔧 Features Required

### View Modes
1. **Tree View** (hierarchical org chart)
2. **List View** (table with manager column)
3. **Grid View** (card-based layout)

### Actions
1. **Edit Manager** - Reassign reporting manager
2. **View Details** - Show employee full profile
3. **View Subordinates** - Expand to see all reports
4. **Export Hierarchy** - Download as PDF/Excel

### Interactions
1. **Click on employee** - Show detail sidebar
2. **Hover on card** - Show quick stats tooltip
3. **Expand/Collapse** - Show/hide subordinates
4. **Drag & Drop** - Reassign manager (future feature)

---

## 📊 Data Requirements

### API Endpoint Enhancement

**GET /api/employees/hierarchy**

Current response is unclear. Need:

```json
{
  "success": true,
  "data": {
    "hierarchy": {
      "generalManagers": [
        {
          "id": "emp-001",
          "name": "Rajesh Kumar",
          "email": "rajesh@dealership.com",
          "role": "GENERAL_MANAGER",
          "directReports": ["emp-002", "emp-003", "emp-004"],
          "totalSubordinates": 12,
          "performanceScore": 92
        }
      ],
      "salesManagers": [
        {
          "id": "emp-002",
          "name": "Priya Sharma",
          "email": "priya@dealership.com",
          "role": "SALES_MANAGER",
          "managerId": "emp-001",
          "directReports": ["emp-005", "emp-006"],
          "totalSubordinates": 6,
          "performanceScore": 88
        }
      ],
      "teamLeads": [...],
      "advisors": [...]
    },
    "stats": {
      "totalEmployees": 42,
      "byRole": {
        "GENERAL_MANAGER": 1,
        "SALES_MANAGER": 3,
        "TEAM_LEAD": 8,
        "CUSTOMER_ADVISOR": 30
      },
      "avgTeamSize": 5.2
    }
  }
}
```

---

## 🎨 Color Coding by Role

```css
GENERAL_MANAGER: #1976d2 (Blue)
SALES_MANAGER:   #388e3c (Green)   // NEW
TEAM_LEAD:       #f57c00 (Orange)
CUSTOMER_ADVISOR: #7b1fa2 (Purple)
```

---

## 📱 Responsive Design

- **Desktop:** Full tree view with all levels
- **Tablet:** Collapsible sections by role
- **Mobile:** List view with expandable cards

---

## ♿ Accessibility

- Keyboard navigation
- Screen reader support
- High contrast mode
- Focus indicators
- ARIA labels for all interactive elements

---

## 🚀 Future Enhancements

1. Performance metrics per employee
2. Sales targets vs achievements
3. Historical reporting changes log
4. Bulk manager reassignment
5. Auto-suggest manager based on team capacity
6. Export org chart as image

