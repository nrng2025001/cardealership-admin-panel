#!/bin/bash

FILES=(
  "src/pages/hierarchy/HierarchyPage.tsx"
  "src/pages/stocks/StockForm.tsx"
  "src/pages/stocks/StocksPage.tsx"
  "src/pages/quotations/QuotationsPage.tsx"
  "src/pages/quotations/QuotationForm.tsx"
  "src/pages/enquiries/EnquiryForm.tsx"
  "src/pages/enquiries/EnquiriesPage.tsx"
  "src/pages/employees/EmployeeForm.tsx"
  "src/pages/employees/EmployeesPage.tsx"
  "src/pages/bookings/BookingForm.tsx"
  "src/pages/bookings/BookingsPage.tsx"
  "src/pages/dashboard/DashboardPage.tsx"
  "src/pages/admin/BulkUploadPage.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    # Remove Grid2 import
    sed -i '' '/import Grid2 from/d' "$file"
    
    # Add Grid back to imports if not there
    if ! grep -q "Grid," "$file"; then
      sed -i '' 's/} from .@mui\/material.;/  Grid,\n} from '\''@mui\/material'\'';/' "$file"
    fi
    
    # Replace Grid2 tags back to Grid
    sed -i '' 's/<Grid2 /<Grid /g' "$file"
    sed -i '' 's/<\/Grid2>/<\/Grid>/g' "$file"
    
    echo "✅ Reverted $(basename $file)"
  fi
done

echo ""
echo "🎉 All Grid components reverted!"
