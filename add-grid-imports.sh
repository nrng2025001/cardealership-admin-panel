#!/bin/bash

# Files that need Grid imported
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
    # Check if Grid is already imported
    if ! grep -q "Grid," "$file"; then
      # Add Grid to imports right before the closing } from '@mui/material'
      sed -i '' "s/} from '@mui\/material';/  Grid,\n} from '@mui\/material';/" "$file"
      echo "✅ Added Grid import to $(basename $file)"
    else
      echo "⏭️  Grid already imported in $(basename $file)"
    fi
  fi
done

echo ""
echo "🎉 All Grid imports added!"
