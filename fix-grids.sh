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
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    # Replace Grid import
    sed -i '' 's/Grid,//' "$file"
    sed -i '' '/from .@mui\/material.;/a\
import Grid2 from '\''@mui/material/Grid2'\'';
' "$file"
    
    # Replace Grid tags with Grid2
    sed -i '' 's/<Grid /<Grid2 /g' "$file"
    sed -i '' 's/<\/Grid>/<\/Grid2>/g' "$file"
    
    echo "✅ Fixed $(basename $file)"
  fi
done

echo ""
echo "🎉 All Grid components updated to Grid2!"
