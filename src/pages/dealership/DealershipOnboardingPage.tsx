// Dealership Onboarding Page
// Multi-step wizard for setting up a new dealership

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Business,
  LocationOn,
  DirectionsCar,
  Palette,
  CheckCircle,
  Add,
  Delete,
  ArrowBack,
  ArrowForward,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { dealershipAPI } from '@/api/dealership';

const steps = [
  'Dealership Information',
  'Vehicle Brands & Models',
  'Variants & Pricing',
  'Review & Complete',
];

// Match backend DealershipType enum
const CAR_BRANDS = ['TATA', 'UNIVERSAL', 'MAHINDRA', 'HYUNDAI', 'MARUTI', 'OTHER'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'CNG', 'Hybrid'];
const TRANSMISSION_TYPES = ['Manual', 'Automatic', 'AMT', 'CVT'];

interface DealershipData {
  // Basic Information
  name: string;
  code: string;
  type: 'TATA' | 'UNIVERSAL';
  
  // Contact
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  
  // Business
  gstNumber: string;
  panNumber: string;
  
  // Brands
  brands: string[];
  
  // Vehicle Catalog
  catalog: VehicleCatalogEntry[];
}

interface VehicleCatalogEntry {
  brand: string;
  model: string;
  variants: VehicleVariant[];
}

interface VehicleVariant {
  id: string;
  name: string;
  vcCode: string;
  fuelTypes: string[];
  transmissions: string[];
  colors: ColorOption[];
  exShowroomPrice: number;
  onRoadPrice: number;
}

interface ColorOption {
  name: string;
  code: string;
  additionalCost: number;
}

export const DealershipOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(!isEditMode);
  
  const [dealershipData, setDealershipData] = useState<DealershipData>({
    name: '',
    code: '',
    type: 'UNIVERSAL',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gstNumber: '',
    panNumber: '',
    brands: [],
    catalog: [],
  });

  const [currentModel, setCurrentModel] = useState({
    brand: '',
    model: '',
    variants: [] as VehicleVariant[],
  });

  const [currentVariant, setCurrentVariant] = useState<Partial<VehicleVariant>>({
    name: '',
    vcCode: '',
    fuelTypes: [],
    transmissions: [],
    colors: [],
    exShowroomPrice: 0,
    onRoadPrice: 0,
  });

  // Check if admin already has a dealership (only for create mode)
  useEffect(() => {
    const checkExistingDealership = async () => {
      if (isEditMode) {
        setCheckingExisting(false);
        return;
      }

      try {
        console.log('🔍 [ONBOARDING] Checking if admin already has a dealership...');
        const response = await dealershipAPI.getDealerships({ limit: 1 });
        
        if (response.data?.success && response.data.data?.dealerships) {
          const dealerships = response.data.data.dealerships;
          
          if (dealerships.length > 0) {
            console.log('⚠️ [ONBOARDING] Admin already has a dealership, redirecting...');
            setError('You have already created a dealership. Each admin can create only one dealership.');
            setTimeout(() => {
              navigate('/admin/dealerships');
            }, 2000);
            return;
          }
        }
        
        console.log('✅ [ONBOARDING] Admin can create a dealership');
      } catch (err) {
        console.error('❌ [ONBOARDING] Error checking existing dealership:', err);
      } finally {
        setCheckingExisting(false);
      }
    };

    checkExistingDealership();
  }, [isEditMode, navigate]);

  // Load existing dealership data in edit mode
  useEffect(() => {
    const loadDealership = async () => {
      if (!isEditMode || !id) return;

      try {
        setInitialLoading(true);
        console.log('📊 [EDIT MODE] Loading dealership:', id);
        
        const response = await dealershipAPI.getDealershipById(id);
        
        if (response.data?.success && response.data.data?.dealership) {
          const dealership = response.data.data.dealership;
          console.log('✅ [EDIT MODE] Loaded dealership:', dealership);
          
          // Populate form with existing data
          setDealershipData({
            name: dealership.name,
            code: dealership.code,
            type: dealership.type,
            email: dealership.email,
            phone: dealership.phone,
            address: dealership.address,
            city: dealership.city,
            state: dealership.state,
            pincode: dealership.pincode,
            gstNumber: dealership.gstNumber,
            panNumber: dealership.panNumber,
            brands: dealership.brands,
            catalog: [], // Catalog is managed separately
          });

          // Load catalog if available
          try {
            const catalogResponse = await dealershipAPI.getDealershipCatalog(id);
            if (catalogResponse.data?.success && catalogResponse.data.data?.catalog) {
              // Transform catalog data to match the form structure
              // This is a simplified version - you may need to adjust based on API response
              console.log('✅ [EDIT MODE] Loaded catalog:', catalogResponse.data.data.catalog);
            }
          } catch (err) {
            console.warn('⚠️ [EDIT MODE] Could not load catalog:', err);
          }
        }
      } catch (err: any) {
        console.error('❌ [EDIT MODE] Failed to load dealership:', err);
        setError(err.response?.data?.message || 'Failed to load dealership data');
      } finally {
        setInitialLoading(false);
      }
    };

    loadDealership();
  }, [id, isEditMode]);

  // Step 1: Dealership Information
  const renderDealershipInfo = () => (
    <Card>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Business sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Dealership Information
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enter your dealership's basic information and contact details
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Dealership Name"
              placeholder="e.g., Mumbai Tata Motors"
              value={dealershipData.name}
              onChange={(e) => setDealershipData({ ...dealershipData, name: e.target.value })}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Dealership Code"
              placeholder="e.g., TATA-MUM-001"
              value={dealershipData.code}
              onChange={(e) => setDealershipData({ ...dealershipData, code: e.target.value.toUpperCase() })}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Dealership Type</InputLabel>
              <Select
                value={dealershipData.type}
                onChange={(e) => setDealershipData({ ...dealershipData, type: e.target.value as 'TATA' | 'UNIVERSAL' })}
              >
                <MenuItem value="TATA">TATA Exclusive</MenuItem>
                <MenuItem value="UNIVERSAL">Multi-Brand (Universal)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              type="email"
              label="Email"
              value={dealershipData.email}
              onChange={(e) => setDealershipData({ ...dealershipData, email: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Phone"
              placeholder="+91-9876543210"
              value={dealershipData.phone}
              onChange={(e) => setDealershipData({ ...dealershipData, phone: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="GST Number"
              placeholder="27XXXXX1234X1ZX"
              value={dealershipData.gstNumber}
              onChange={(e) => setDealershipData({ ...dealershipData, gstNumber: e.target.value.toUpperCase() })}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="PAN Number"
              placeholder="XXXXX1234X"
              value={dealershipData.panNumber}
              onChange={(e) => setDealershipData({ ...dealershipData, panNumber: e.target.value.toUpperCase() })}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              multiline
              rows={2}
              label="Address"
              value={dealershipData.address}
              onChange={(e) => setDealershipData({ ...dealershipData, address: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              required
              label="City"
              value={dealershipData.city}
              onChange={(e) => setDealershipData({ ...dealershipData, city: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              required
              label="State"
              value={dealershipData.state}
              onChange={(e) => setDealershipData({ ...dealershipData, state: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              required
              label="Pincode"
              value={dealershipData.pincode}
              onChange={(e) => setDealershipData({ ...dealershipData, pincode: e.target.value })}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  // Step 2: Brands & Models
  const renderBrandsAndModels = () => (
    <Card>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <DirectionsCar sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Car Brands & Models
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select which car brands you sell and add their models
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Select Brands You Sell
          </Typography>
          <FormGroup row>
            {CAR_BRANDS.map((brand) => (
              <FormControlLabel
                key={brand}
                control={
                  <Checkbox
                    checked={dealershipData.brands.includes(brand)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setDealershipData({
                          ...dealershipData,
                          brands: [...dealershipData.brands, brand],
                        });
                      } else {
                        setDealershipData({
                          ...dealershipData,
                          brands: dealershipData.brands.filter((b) => b !== brand),
                        });
                      }
                    }}
                  />
                }
                label={brand}
              />
            ))}
          </FormGroup>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Add Models
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={5}>
              <FormControl fullWidth>
                <InputLabel>Brand</InputLabel>
                <Select
                  value={currentModel.brand}
                  onChange={(e) => setCurrentModel({ ...currentModel, brand: e.target.value })}
                >
                  {dealershipData.brands.map((brand) => (
                    <MenuItem key={brand} value={brand}>
                      {brand}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label="Model Name"
                placeholder="e.g., Nexon"
                value={currentModel.model}
                onChange={(e) => setCurrentModel({ ...currentModel, model: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Add />}
                onClick={() => {
                  if (currentModel.brand && currentModel.model) {
                    setDealershipData({
                      ...dealershipData,
                      catalog: [
                        ...dealershipData.catalog,
                        {
                          brand: currentModel.brand,
                          model: currentModel.model,
                          variants: [],
                        },
                      ],
                    });
                    setCurrentModel({ brand: '', model: '', variants: [] });
                  }
                }}
                sx={{ height: '56px' }}
              >
                Add
              </Button>
            </Grid>
          </Grid>

          {/* Added Models */}
          <Box sx={{ mt: 3 }}>
            {dealershipData.catalog.map((entry, index) => (
              <Chip
                key={index}
                label={`${entry.brand} ${entry.model} (${entry.variants.length} variants)`}
                onDelete={() => {
                  setDealershipData({
                    ...dealershipData,
                    catalog: dealershipData.catalog.filter((_, i) => i !== index),
                  });
                }}
                sx={{ m: 0.5 }}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  // Step 3: Variants & Pricing
  const renderVariantsAndPricing = () => (
    <Card>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Palette sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Variants, Colors & Pricing
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure variants, colors, and pricing for each model
          </Typography>
        </Box>

        {dealershipData.catalog.length === 0 ? (
          <Alert severity="info">
            Please add at least one model in the previous step to configure variants.
          </Alert>
        ) : (
          <Box>
            {dealershipData.catalog.map((catalogEntry, catalogIndex) => (
              <Card key={catalogIndex} sx={{ mb: 3, border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {catalogEntry.brand} {catalogEntry.model}
                  </Typography>
                  
                  {/* Variant Configuration Form */}
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Variant Name"
                        placeholder="e.g., XZ+"
                        size="small"
                        value={currentVariant.name || ''}
                        onChange={(e) => setCurrentVariant({ ...currentVariant, name: e.target.value })}
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="VC Code"
                        placeholder="e.g., NXN-XZ-001"
                        size="small"
                        value={currentVariant.vcCode || ''}
                        onChange={(e) => setCurrentVariant({ ...currentVariant, vcCode: e.target.value })}
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Fuel Type</InputLabel>
                        <Select 
                          multiple
                          value={currentVariant.fuelTypes || []}
                          onChange={(e) => setCurrentVariant({ ...currentVariant, fuelTypes: e.target.value as string[] })}
                        >
                          {FUEL_TYPES.map((fuel) => (
                            <MenuItem key={fuel} value={fuel}>
                              {fuel}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Transmission</InputLabel>
                        <Select 
                          multiple
                          value={currentVariant.transmissions || []}
                          onChange={(e) => setCurrentVariant({ ...currentVariant, transmissions: e.target.value as string[] })}
                        >
                          {TRANSMISSION_TYPES.map((trans) => (
                            <MenuItem key={trans} value={trans}>
                              {trans}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Ex-Showroom Price"
                        placeholder="1149000"
                        size="small"
                        value={currentVariant.exShowroomPrice || ''}
                        onChange={(e) => setCurrentVariant({ ...currentVariant, exShowroomPrice: parseFloat(e.target.value) || 0 })}
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        type="number"
                        label="On-Road Price"
                        placeholder="1294000"
                        size="small"
                        value={currentVariant.onRoadPrice || ''}
                        onChange={(e) => setCurrentVariant({ ...currentVariant, onRoadPrice: parseFloat(e.target.value) || 0 })}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        startIcon={<Add />}
                        onClick={() => {
                          if (currentVariant.name && currentVariant.vcCode) {
                            // Add variant to the current catalog entry
                            const updatedCatalog = [...dealershipData.catalog];
                            updatedCatalog[catalogIndex].variants.push({
                              id: `${catalogIndex}-${updatedCatalog[catalogIndex].variants.length}`,
                              name: currentVariant.name || '',
                              vcCode: currentVariant.vcCode || '',
                              fuelTypes: currentVariant.fuelTypes || [],
                              transmissions: currentVariant.transmissions || [],
                              colors: currentVariant.colors || [],
                              exShowroomPrice: currentVariant.exShowroomPrice || 0,
                              onRoadPrice: currentVariant.onRoadPrice || 0,
                            });
                            setDealershipData({ ...dealershipData, catalog: updatedCatalog });
                            // Reset variant form
                            setCurrentVariant({
                              name: '',
                              vcCode: '',
                              fuelTypes: [],
                              transmissions: [],
                              colors: [],
                              exShowroomPrice: 0,
                              onRoadPrice: 0,
                            });
                          }
                        }}
                      >
                        Add Variant
                      </Button>
                    </Grid>
                  </Grid>

                  {/* Display added variants */}
                  {catalogEntry.variants.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Configured Variants ({catalogEntry.variants.length})
                      </Typography>
                      {catalogEntry.variants.map((variant, vIndex) => (
                        <Chip
                          key={vIndex}
                          label={variant.name}
                          size="small"
                          sx={{ m: 0.5 }}
                        />
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );

  // Step 4: Review & Complete
  const renderReview = () => (
    <Card>
      <CardContent>
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Review & Complete
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review your dealership configuration before completing setup
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Dealership Summary */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Dealership Details
                </Typography>
                <Box sx={{ '& > *': { mb: 1 } }}>
                  <Typography variant="body2">
                    <strong>Name:</strong> {dealershipData.name || 'Not provided'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Code:</strong> {dealershipData.code || 'Not provided'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Type:</strong> {dealershipData.type}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Email:</strong> {dealershipData.email || 'Not provided'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Phone:</strong> {dealershipData.phone || 'Not provided'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>GST:</strong> {dealershipData.gstNumber || 'Not provided'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Vehicle Catalog Summary */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Vehicle Catalog
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Brands:</strong> {dealershipData.brands.join(', ') || 'None selected'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Models Added:</strong> {dealershipData.catalog.length}
                </Typography>
                {dealershipData.catalog.map((entry, index) => (
                  <Box key={index} sx={{ ml: 2, mb: 1 }}>
                    <Typography variant="body2">
                      • {entry.brand} {entry.model} ({entry.variants.length} variants)
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Alert severity="info" sx={{ mt: 3 }}>
          <strong>Note:</strong> You can add more models and variants later from the dealership settings page.
        </Alert>
      </CardContent>
    </Card>
  );

  const handleNext = () => {
    // Validation for each step
    if (activeStep === 0) {
      if (!dealershipData.name || !dealershipData.code || !dealershipData.email) {
        setError('Please fill in all required fields');
        return;
      }
    }

    if (activeStep === 1) {
      if (dealershipData.brands.length === 0) {
        setError('Please select at least one brand');
        return;
      }
    }

    setError(null);
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setError(null);
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isEditMode && id) {
        // Update existing dealership
        console.log('✏️ [EDIT MODE] Updating dealership:', id);
        
        const dealershipResponse = await dealershipAPI.updateDealership(id, {
          name: dealershipData.name,
          code: dealershipData.code,
          type: dealershipData.type,
          email: dealershipData.email,
          phone: dealershipData.phone,
          address: dealershipData.address,
          city: dealershipData.city,
          state: dealershipData.state,
          pincode: dealershipData.pincode,
          gstNumber: dealershipData.gstNumber,
          panNumber: dealershipData.panNumber,
          brands: dealershipData.brands,
        });

        if (!dealershipResponse.data?.success) {
          throw new Error(dealershipResponse.data?.message || 'Failed to update dealership');
        }

        console.log('✅ [EDIT MODE] Dealership updated successfully');
        
        // Navigate back to dealership management
        navigate('/admin/dealerships');
      } else {
        // Create new dealership
        console.log('🎉 [ONBOARDING] Creating dealership:', dealershipData);
        
        const dealershipResponse = await dealershipAPI.createDealership({
          name: dealershipData.name,
          code: dealershipData.code,
          type: dealershipData.type,
          email: dealershipData.email,
          phone: dealershipData.phone,
          address: dealershipData.address,
          city: dealershipData.city,
          state: dealershipData.state,
          pincode: dealershipData.pincode,
          gstNumber: dealershipData.gstNumber,
          panNumber: dealershipData.panNumber,
          brands: dealershipData.brands,
        });

        if (!dealershipResponse.data?.success) {
          throw new Error(dealershipResponse.data?.message || 'Failed to create dealership');
        }

        const createdDealership = dealershipResponse.data.data?.dealership;
        console.log('✅ [ONBOARDING] Dealership created:', createdDealership?.id);

        // Add vehicle catalog entries
        if (dealershipData.catalog.length > 0 && createdDealership?.id) {
          console.log('📦 [ONBOARDING] Adding vehicle catalog...');
          
          for (const catalogEntry of dealershipData.catalog) {
            await dealershipAPI.addVehicleToCatalog(createdDealership.id, {
              brand: catalogEntry.brand,
              model: catalogEntry.model,
              variants: catalogEntry.variants,
            });
          }
          
          console.log('✅ [ONBOARDING] Catalog added successfully');
        }

        // Mark onboarding as complete
        if (createdDealership?.id) {
          await dealershipAPI.completeOnboarding(createdDealership.id);
          console.log('✅ [ONBOARDING] Onboarding marked complete');
        }

        // Navigate to dashboard
        console.log('🎉 [ONBOARDING] Setup complete! Redirecting to dashboard...');
        navigate('/');
      }
    } catch (err: any) {
      console.error(`❌ [${isEditMode ? 'EDIT' : 'ONBOARDING'}] Error:`, err);
      setError(err.response?.data?.message || err.message || `Failed to ${isEditMode ? 'update' : 'complete onboarding'}`);
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderDealershipInfo();
      case 1:
        return renderBrandsAndModels();
      case 2:
        return renderVariantsAndPricing();
      case 3:
        return renderReview();
      default:
        return null;
    }
  };

  // Show loading state while checking or fetching dealership data
  if (initialLoading || checkingExisting) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography sx={{ mt: 2 }}>
            {checkingExisting ? 'Checking permissions...' : 'Loading dealership data...'}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        {isEditMode && (
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/admin/dealerships')}
            sx={{ mb: 2 }}
          >
            Back to Dealerships
          </Button>
        )}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
            {isEditMode ? 'Edit Dealership' : 'Dealership Onboarding'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isEditMode ? 'Update dealership information' : 'Complete these steps to set up your dealership'}
          </Typography>
        </Box>
      </Box>

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Step Content */}
      <Box sx={{ mb: 4 }}>{getStepContent(activeStep)}</Box>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          disabled={activeStep === 0 || loading}
          onClick={handleBack}
          startIcon={<ArrowBack />}
        >
          Back
        </Button>

        <Box>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleComplete}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
            >
              {loading 
                ? (isEditMode ? 'Updating...' : 'Completing Setup...') 
                : (isEditMode ? 'Update Dealership' : 'Complete Setup')
              }
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<ArrowForward />}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

