# 📊 Dashboard Integration Guide - Booking Advisor Assignment

## 🎯 **Overview**

This guide provides **complete instructions** for integrating the new booking advisor assignment features into your React dashboard.

**New Features Implemented:**
1. ✅ Bulk Assignment - Assign multiple bookings to one advisor
2. ✅ Unassign Feature - Remove advisor from booking  
3. ✅ Auto-Assignment - Round-robin, least-load, or random distribution
4. ✅ Excel Template Generator - Download template with advisor IDs pre-filled

---

## 📦 **Backend API Endpoints (Already Implemented)**

### **1. Bulk Assign Bookings**

```typescript
POST /api/bookings/bulk-assign

Request:
{
  "bookingIds": ["booking1", "booking2", "booking3"],
  "advisorId": "gpJDwdJlvacGUACQOFbt4Fibtbo1",
  "reason": "Weekly assignment batch" // optional
}

Response:
{
  "success": true,
  "message": "Successfully assigned 3 booking(s) to Aditya jaif",
  "data": {
    "assignedCount": 3,
    "advisorId": "gpJDwdJlvacGUACQOFbt4Fibtbo1",
    "advisorName": "Aditya jaif",
    "bookingIds": ["booking1", "booking2", "booking3"]
  }
}
```

**Permissions:** Admin, General Manager, Sales Manager, Team Lead

---

### **2. Unassign Advisor from Booking**

```typescript
PATCH /api/bookings/:bookingId/unassign

Request:
{
  "reason": "Customer requested different advisor" // optional
}

Response:
{
  "success": true,
  "message": "Advisor unassigned successfully",
  "data": {
    "booking": {
      "id": "booking_id",
      "advisorId": null,
      "status": "PENDING"
    }
  }
}
```

**Permissions:** Admin, General Manager, Sales Manager, Team Lead

---

### **3. Auto-Assign Bookings**

```typescript
POST /api/bookings/auto-assign

Request:
{
  "bookingIds": ["booking1", "booking2", "booking3"],
  "strategy": "ROUND_ROBIN" | "LEAST_LOAD" | "RANDOM",
  "dealershipId": "optional_dealership_id" // defaults to user's dealership
}

Response:
{
  "success": true,
  "message": "Successfully auto-assigned 3 booking(s) using ROUND_ROBIN strategy",
  "data": {
    "strategy": "ROUND_ROBIN",
    "totalAssigned": 3,
    "summary": [
      {
        "advisorId": "advisor1",
        "advisorName": "John Doe",
        "assignedCount": 2
      },
      {
        "advisorId": "advisor2",
        "advisorName": "Jane Smith",
        "assignedCount": 1
      }
    ],
    "assignments": [
      {
        "bookingId": "booking1",
        "advisorId": "advisor1",
        "advisorName": "John Doe"
      },
      // ...
    ]
  }
}
```

**Strategies:**
- `ROUND_ROBIN` - Distributes evenly across all advisors
- `LEAST_LOAD` - Assigns to advisor with fewest active bookings
- `RANDOM` - Random assignment

**Permissions:** Admin, General Manager, Sales Manager

---

### **4. Generate Excel Template**

```typescript
GET /api/bookings/import/template?includeAdvisors=true&sampleRows=5

Response: Excel file download

Template includes:
- Sheet 1: Bookings Template (with sample data)
- Sheet 2: Instructions (field descriptions)
- Sheet 3: Advisor List (all advisors with their Firebase UIDs)
```

**Query Parameters:**
- `includeAdvisors` (boolean) - Include advisor_id columns (default: true)
- `sampleRows` (number) - Number of sample rows (1-10, default: 5)

**Permissions:** Admin, General Manager, Sales Manager

---

## 🎨 **Dashboard UI Changes Needed**

### **PAGE 1: Bookings List Page**

**Location:** `src/pages/bookings/BookingsList.tsx`

#### **Changes:**

1. **Add Multi-Select Checkbox Column**
   
```tsx
const [selectedBookings, setSelectedBookings] = useState<string[]>([]);

// Add checkbox column to DataGrid
const columns = [
  {
    field: 'select',
    headerName: '',
    width: 50,
    renderCell: (params: any) => (
      <Checkbox
        checked={selectedBookings.includes(params.row.id)}
        onChange={(e) => {
          if (e.target.checked) {
            setSelectedBookings([...selectedBookings, params.row.id]);
          } else {
            setSelectedBookings(selectedBookings.filter(id => id !== params.row.id));
          }
        }}
      />
    )
  },
  // ... existing columns
];
```

2. **Add "Select All" in Header**

```tsx
<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
  <FormControlLabel
    control={
      <Checkbox
        checked={selectedBookings.length === bookings.length && bookings.length > 0}
        indeterminate={selectedBookings.length > 0 && selectedBookings.length < bookings.length}
        onChange={(e) => {
          if (e.target.checked) {
            setSelectedBookings(bookings.map(b => b.id));
          } else {
            setSelectedBookings([]);
          }
        }}
      />
    }
    label={`${selectedBookings.length} selected`}
  />
</Box>
```

3. **Add Bulk Actions Toolbar (Shows when bookings selected)**

```tsx
{selectedBookings.length > 0 && (
  <Paper sx={{ p: 2, mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
    <Typography variant="body1">
      {selectedBookings.length} booking(s) selected
    </Typography>
    
    <Button
      variant="contained"
      startIcon={<AssignmentIcon />}
      onClick={() => setAssignDialogOpen(true)}
    >
      Assign to Advisor
    </Button>
    
    <Button
      variant="contained"
      color="secondary"
      startIcon={<AutoModeIcon />}
      onClick={() => setAutoAssignDialogOpen(true)}
    >
      Auto-Assign
    </Button>
    
    <Button
      variant="outlined"
      color="error"
      startIcon={<PersonOffIcon />}
      onClick={handleBulkUnassign}
    >
      Unassign All
    </Button>
    
    <Button
      variant="text"
      onClick={() => setSelectedBookings([])}
    >
      Clear Selection
    </Button>
  </Paper>
)}
```

4. **Add Filter for Unassigned Bookings**

```tsx
<FormControlLabel
  control={
    <Switch
      checked={showUnassignedOnly}
      onChange={(e) => setShowUnassignedOnly(e.target.checked)}
    />
  }
  label="Show Unassigned Only"
/>
```

5. **Add Action Menu for Individual Bookings**

```tsx
// In each row, add action menu
<IconButton onClick={(e) => handleMenuClick(e, params.row)}>
  <MoreVertIcon />
</IconButton>

<Menu anchorEl={anchorEl} open={Boolean(anchorEl)}>
  {selectedBooking?.advisorId ? (
    <>
      <MenuItem onClick={handleReassign}>
        <ListItemIcon><SwapHorizIcon /></ListItemIcon>
        <ListItemText>Reassign Advisor</ListItemText>
      </MenuItem>
      <MenuItem onClick={handleUnassign}>
        <ListItemIcon><PersonOffIcon /></ListItemIcon>
        <ListItemText>Unassign Advisor</ListItemText>
      </MenuItem>
    </>
  ) : (
    <MenuItem onClick={handleAssign}>
      <ListItemIcon><AssignmentIcon /></ListItemIcon>
      <ListItemText>Assign Advisor</ListItemText>
    </MenuItem>
  )}
</Menu>
```

---

### **COMPONENT 1: Bulk Assign Dialog**

**Create:** `src/components/bookings/BulkAssignDialog.tsx`

```tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Box,
  Avatar,
  ListItemText
} from '@mui/material';
import apiClient from '@/api/client';

interface BulkAssignDialogProps {
  open: boolean;
  bookingIds: string[];
  onClose: () => void;
  onSuccess: () => void;
}

export const BulkAssignDialog: React.FC<BulkAssignDialogProps> = ({
  open,
  bookingIds,
  onClose,
  onSuccess
}) => {
  const [advisors, setAdvisors] = useState<any[]>([]);
  const [selectedAdvisorId, setSelectedAdvisorId] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchAdvisors();
    }
  }, [open]);

  const fetchAdvisors = async () => {
    try {
      const response = await apiClient.get('/auth/users?role=CUSTOMER_ADVISOR');
      setAdvisors(response.data.data.users || []);
    } catch (error) {
      console.error('Failed to fetch advisors:', error);
    }
  };

  const handleAssign = async () => {
    if (!selectedAdvisorId) return;

    setLoading(true);
    try {
      await apiClient.post('/bookings/bulk-assign', {
        bookingIds,
        advisorId: selectedAdvisorId,
        reason
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Bulk assign failed:', error);
      alert('Failed to assign bookings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Assign {bookingIds.length} Bookings to Advisor</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select Advisor</InputLabel>
            <Select
              value={selectedAdvisorId}
              onChange={(e) => setSelectedAdvisorId(e.target.value)}
              label="Select Advisor"
            >
              {advisors.map((advisor) => (
                <MenuItem key={advisor.firebaseUid} value={advisor.firebaseUid}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar>{advisor.name[0]}</Avatar>
                    <ListItemText
                      primary={advisor.name}
                      secondary={`${advisor.email} - ${advisor.employeeId}`}
                    />
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Reason (Optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            multiline
            rows={2}
            placeholder="Why are you assigning these bookings?"
          />

          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            All {bookingIds.length} selected bookings will be assigned to this advisor
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleAssign}
          variant="contained"
          disabled={!selectedAdvisorId || loading}
        >
          {loading ? 'Assigning...' : 'Assign'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

---

### **COMPONENT 2: Auto-Assign Dialog**

**Create:** `src/components/bookings/AutoAssignDialog.tsx`

```tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  Alert
} from '@mui/material';
import apiClient from '@/api/client';

interface AutoAssignDialogProps {
  open: boolean;
  bookingIds: string[];
  onClose: () => void;
  onSuccess: () => void;
}

export const AutoAssignDialog: React.FC<AutoAssignDialogProps> = ({
  open,
  bookingIds,
  onClose,
  onSuccess
}) => {
  const [strategy, setStrategy] = useState<'ROUND_ROBIN' | 'LEAST_LOAD' | 'RANDOM'>('ROUND_ROBIN');
  const [loading, setLoading] = useState(false);

  const strategyDescriptions = {
    ROUND_ROBIN: 'Distribute bookings evenly across all advisors in order',
    LEAST_LOAD: 'Assign to advisors with the fewest active bookings first',
    RANDOM: 'Randomly assign bookings to available advisors'
  };

  const handleAutoAssign = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post('/bookings/auto-assign', {
        bookingIds,
        strategy
      });

      alert(`Successfully assigned ${bookingIds.length} bookings!\n\n${response.data.data.summary.map((s: any) => `${s.advisorName}: ${s.assignedCount} bookings`).join('\n')}`);
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Auto-assign failed:', error);
      alert('Failed to auto-assign bookings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Auto-Assign {bookingIds.length} Bookings</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select an assignment strategy:
          </Typography>

          <RadioGroup value={strategy} onChange={(e) => setStrategy(e.target.value as any)}>
            <FormControlLabel
              value="ROUND_ROBIN"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1">Round Robin</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {strategyDescriptions.ROUND_ROBIN}
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="LEAST_LOAD"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1">Least Load (Recommended)</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {strategyDescriptions.LEAST_LOAD}
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="RANDOM"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1">Random</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {strategyDescriptions.RANDOM}
                  </Typography>
                </Box>
              }
            />
          </RadioGroup>

          <Alert severity="info" sx={{ mt: 2 }}>
            Bookings will be automatically distributed among all active Customer Advisors in your dealership
          </Alert>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleAutoAssign}
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Assigning...' : 'Auto-Assign'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

---

### **PAGE 2: Bulk Import Page**

**Location:** `src/pages/bookings/BulkImport.tsx`

#### **Changes:**

1. **Add "Download Template" Button**

```tsx
<Box sx={{ mb: 3 }}>
  <Button
    variant="outlined"
    startIcon={<DownloadIcon />}
    onClick={handleDownloadTemplate}
    sx={{ mr: 2 }}
  >
    Download Excel Template
  </Button>
  
  <Typography variant="caption" color="text.secondary">
    Template includes advisor IDs for easy assignment
  </Typography>
</Box>

// Handler
const handleDownloadTemplate = async () => {
  try {
    const response = await apiClient.get('/bookings/import/template', {
      responseType: 'blob',
      params: {
        includeAdvisors: true,
        sampleRows: 5
      }
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `booking-template-${Date.now()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error('Failed to download template:', error);
    alert('Failed to download template');
  }
};
```

2. **Add Instructions Card**

```tsx
<Card sx={{ mb: 3 }}>
  <CardContent>
    <Typography variant="h6" gutterBottom>
      Bulk Import with Advisor Assignment
    </Typography>
    <Typography variant="body2" color="text.secondary" paragraph>
      You can now assign bookings to advisors directly during import!
    </Typography>
    <Typography variant="body2" component="div">
      <strong>Steps:</strong>
      <ol>
        <li>Download the Excel template (includes advisor list)</li>
        <li>Fill in booking details</li>
        <li>Copy advisor Firebase UID from "Advisor List" sheet</li>
        <li>Paste into "advisor_id" column for each booking</li>
        <li>Upload the completed file</li>
      </ol>
    </Typography>
  </CardContent>
</Card>
```

---

### **PAGE 3: Bookings Detail Page**

**Location:** `src/pages/bookings/BookingDetail.tsx`

#### **Changes:**

1. **Add Advisor Assignment Section**

```tsx
<Card sx={{ mb: 3 }}>
  <CardHeader title="Advisor Assignment" />
  <CardContent>
    {booking.advisorId ? (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar>{booking.advisorName?.[0]}</Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body1">{booking.advisorName}</Typography>
          <Typography variant="caption" color="text.secondary">
            {booking.advisorEmail}
          </Typography>
        </Box>
        <Button
          size="small"
          variant="outlined"
          onClick={() => setReassignDialogOpen(true)}
        >
          Reassign
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="error"
          onClick={handleUnassign}
        >
          Unassign
        </Button>
      </Box>
    ) : (
      <Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          No advisor assigned
        </Typography>
        <Button
          variant="contained"
          size="small"
          onClick={() => setAssignDialogOpen(true)}
        >
          Assign Advisor
        </Button>
      </Box>
    )}
  </CardContent>
</Card>

// Unassign handler
const handleUnassign = async () => {
  if (!confirm('Are you sure you want to unassign this booking?')) return;

  try {
    await apiClient.patch(`/bookings/${booking.id}/unassign`, {
      reason: 'Unassigned from detail page'
    });
    
    // Refresh booking data
    fetchBooking();
  } catch (error) {
    console.error('Failed to unassign:', error);
    alert('Failed to unassign booking');
  }
};
```

---

## 🔧 **API Client Updates**

**File:** `src/api/bookings.ts`

Add these new functions:

```tsx
// Bulk assign bookings to advisor
export const bulkAssignBookings = async (
  bookingIds: string[],
  advisorId: string,
  reason?: string
) => {
  return apiClient.post('/bookings/bulk-assign', {
    bookingIds,
    advisorId,
    reason
  });
};

// Unassign advisor from booking
export const unassignBooking = async (bookingId: string, reason?: string) => {
  return apiClient.patch(`/bookings/${bookingId}/unassign`, { reason });
};

// Auto-assign bookings
export const autoAssignBookings = async (
  bookingIds: string[],
  strategy: 'ROUND_ROBIN' | 'LEAST_LOAD' | 'RANDOM'
) => {
  return apiClient.post('/bookings/auto-assign', {
    bookingIds,
    strategy
  });
};

// Download Excel template
export const downloadBookingTemplate = async (includeAdvisors = true, sampleRows = 5) => {
  return apiClient.get('/bookings/import/template', {
    responseType: 'blob',
    params: { includeAdvisors, sampleRows }
  });
};
```

---

## 📊 **New Dashboard Widgets (Optional)**

### **Widget: Advisor Load Dashboard**

**Create:** `src/components/dashboard/AdvisorLoadWidget.tsx`

```tsx
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent, Box, Typography, LinearProgress } from '@mui/material';
import apiClient from '@/api/client';

export const AdvisorLoadWidget: React.FC = () => {
  const [advisorLoads, setAdvisorLoads] = useState<any[]>([]);

  useEffect(() => {
    fetchAdvisorLoads();
  }, []);

  const fetchAdvisorLoads = async () => {
    try {
      // Get all advisors
      const advisorsResponse = await apiClient.get('/auth/users?role=CUSTOMER_ADVISOR');
      const advisors = advisorsResponse.data.data.users || [];

      // Get booking counts for each advisor
      const loads = await Promise.all(
        advisors.map(async (advisor: any) => {
          const bookingsResponse = await apiClient.get('/bookings', {
            params: {
              advisorId: advisor.firebaseUid,
              status: ['PENDING', 'IN_PROGRESS', 'CONFIRMED']
            }
          });
          return {
            name: advisor.name,
            email: advisor.email,
            count: bookingsResponse.data.data.total || 0
          };
        })
      );

      setAdvisorLoads(loads.sort((a, b) => b.count - a.count));
    } catch (error) {
      console.error('Failed to fetch advisor loads:', error);
    }
  };

  const maxLoad = Math.max(...advisorLoads.map(a => a.count), 1);

  return (
    <Card>
      <CardHeader title="Advisor Workload" />
      <CardContent>
        {advisorLoads.map((advisor) => (
          <Box key={advisor.email} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">{advisor.name}</Typography>
              <Typography variant="body2" color="primary">
                {advisor.count} bookings
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(advisor.count / maxLoad) * 100}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};
```

---

### **Widget: Unassigned Bookings Counter**

```tsx
<Card>
  <CardContent>
    <Typography variant="h4" color="error">
      {unassignedCount}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Unassigned Bookings
    </Typography>
    <Button
      size="small"
      variant="contained"
      sx={{ mt: 1 }}
      onClick={() => navigate('/bookings?unassigned=true')}
    >
      Assign Now
    </Button>
  </CardContent>
</Card>
```

---

## 🎯 **Complete Implementation Checklist**

### **Backend (✅ Already Done)**
- [x] Bulk assign endpoint
- [x] Unassign endpoint
- [x] Auto-assign endpoint
- [x] Excel template generator
- [x] All routes configured
- [x] Permissions set

### **Frontend (❓ Need to Implement)**

#### **Bookings List Page:**
- [ ] Add multi-select checkboxes
- [ ] Add bulk actions toolbar
- [ ] Add "Assign to Advisor" button
- [ ] Add "Auto-Assign" button
- [ ] Add "Unassign" option in row menu
- [ ] Add filter for unassigned bookings

#### **Components:**
- [ ] Create `BulkAssignDialog.tsx`
- [ ] Create `AutoAssignDialog.tsx`
- [ ] Update `BookingDetail.tsx` with assignment section

#### **Bulk Import Page:**
- [ ] Add "Download Template" button
- [ ] Add instructions card
- [ ] Update import flow to handle advisor_id

#### **API Layer:**
- [ ] Add `bulkAssignBookings()` function
- [ ] Add `unassignBooking()` function
- [ ] Add `autoAssignBookings()` function
- [ ] Add `downloadBookingTemplate()` function

#### **Optional Enhancements:**
- [ ] Add Advisor Load Dashboard widget
- [ ] Add Unassigned Bookings counter
- [ ] Add assignment history in audit log

---

## 🚀 **Quick Start Implementation Order**

1. **Start with API Layer** (15 min)
   - Add functions to `src/api/bookings.ts`

2. **Create Dialogs** (30 min)
   - `BulkAssignDialog.tsx`
   - `AutoAssignDialog.tsx`

3. **Update Bookings List** (45 min)
   - Add checkboxes
   - Add bulk actions toolbar
   - Wire up dialogs

4. **Update Bulk Import** (15 min)
   - Add download template button

5. **Test End-to-End** (30 min)
   - Select bookings → Bulk assign
   - Download template → Import with advisors
   - Auto-assign unassigned bookings

**Total Time:** ~2.5 hours for full implementation

---

## 📝 **Testing Guide**

### **Test 1: Bulk Assignment**
1. Navigate to Bookings page
2. Select 3 bookings using checkboxes
3. Click "Assign to Advisor"
4. Select an advisor
5. Click "Assign"
6. Verify: All 3 bookings show the assigned advisor

### **Test 2: Auto-Assignment**
1. Create 10 unassigned bookings
2. Select all 10
3. Click "Auto-Assign"
4. Choose "Least Load" strategy
5. Verify: Bookings distributed evenly among advisors

### **Test 3: Excel Template**
1. Click "Download Template"
2. Open Excel file
3. Verify: Sheet 1 has sample data, Sheet 3 has advisor list
4. Copy advisor UID, paste into advisor_id column
5. Upload file
6. Verify: Bookings imported with correct advisor

### **Test 4: Unassign**
1. Open a booking with an advisor
2. Click "Unassign"
3. Confirm
4. Verify: Booking shows "No advisor assigned"

---

## 🎨 **UI/UX Best Practices**

1. **Show Loading States**
   ```tsx
   {loading && <CircularProgress />}
   ```

2. **Show Success Messages**
   ```tsx
   <Snackbar message="Successfully assigned 5 bookings!" />
   ```

3. **Confirm Destructive Actions**
   ```tsx
   if (!confirm('Unassign advisor?')) return;
   ```

4. **Disable Buttons When No Selection**
   ```tsx
   <Button disabled={selectedBookings.length === 0}>
   ```

5. **Show Selection Count**
   ```tsx
   <Typography>{selectedBookings.length} selected</Typography>
   ```

---

## 🆘 **Troubleshooting**

### **Issue: 403 Forbidden when calling endpoints**
**Solution:** Ensure user has proper role (Admin, GM, SM, or TL)

### **Issue: Template download fails**
**Solution:** Check responseType is set to 'blob' in axios config

### **Issue: Advisor list empty in template**
**Solution:** Verify user has Customer Advisors in their dealership

### **Issue: Bulk assign doesn't update UI**
**Solution:** Call refetch/refresh after successful assignment

---

## 📞 **Support**

If you need help with implementation:

1. **Backend Issues:** Check server logs, verify endpoints with Postman
2. **Frontend Issues:** Check browser console, verify API responses
3. **Permission Issues:** Verify user role in database

---

**Status:** ✅ Backend Complete, 🔧 Frontend Implementation Needed  
**Priority:** High (Essential feature for booking management)  
**Estimated Frontend Work:** 2.5 hours

