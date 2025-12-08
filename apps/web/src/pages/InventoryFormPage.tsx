import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { useInventoryStore } from '../store/inventoryStore';
import { projectService } from '../services/projectService';
import { InventoryItemType, InventoryStatus } from '../types/inventory';
import { Project } from '../types/project';

const inventorySchema = z.object({
  type: z.nativeEnum(InventoryItemType),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  quantity: z.string().min(1, 'Quantity is required'),
  unit: z.string().min(1, 'Unit is required'),
  status: z.nativeEnum(InventoryStatus),
  projectId: z.string().optional(),
  // Material fields
  supplier: z.string().optional(),
  purchaseCost: z.string().optional(),
  purchaseDate: z.string().optional(),
  materialCategory: z.string().optional(),
  // Tool fields
  ownership: z.string().optional(),
  rentalRate: z.string().optional(),
  rentalPeriod: z.string().optional(),
  maintenanceDate: z.string().optional(),
  serialNumber: z.string().optional(),
  // Salvage fields
  condition: z.string().optional(),
  estimatedValue: z.string().optional(),
  reservePrice: z.string().optional(),
  dimensions: z.string().optional(),
  storageLocation: z.string().optional(),
});

export default function InventoryFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const projectIdFromQuery = searchParams.get('projectId');
  const isEditMode = !!id;
  const { currentItem, isLoading: storeLoading, createItem, updateItem, fetchItem, clearCurrentItem } = useInventoryStore();

  const [formData, setFormData] = useState({
    type: InventoryItemType.MATERIAL,
    name: '',
    description: '',
    quantity: '',
    unit: '',
    status: InventoryStatus.IN_STOCK,
    projectId: projectIdFromQuery || '',
    // Material fields
    supplier: '',
    purchaseCost: '',
    purchaseDate: '',
    materialCategory: '',
    // Tool fields
    ownership: '',
    rentalRate: '',
    rentalPeriod: '',
    maintenanceDate: '',
    serialNumber: '',
    // Salvage fields
    condition: '',
    estimatedValue: '',
    reservePrice: '',
    dimensions: '',
    storageLocation: '',
  });

  const [projects, setProjects] = useState<Project[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
    if (isEditMode && id) {
      fetchItem(id);
    } else if (projectIdFromQuery && !isEditMode) {
      // Pre-select project from query param when creating new item
      setFormData((prev) => ({ ...prev, projectId: projectIdFromQuery }));
    }
    return () => clearCurrentItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode, projectIdFromQuery]);

  useEffect(() => {
    if (isEditMode && currentItem) {
      setFormData({
        type: currentItem.type,
        name: currentItem.name,
        description: currentItem.description || '',
        quantity: currentItem.quantity.toString(),
        unit: currentItem.unit,
        status: currentItem.status,
        projectId: currentItem.projectId || '',
        supplier: currentItem.supplier || '',
        purchaseCost: currentItem.purchaseCost?.toString() || '',
        purchaseDate: currentItem.purchaseDate ? currentItem.purchaseDate.split('T')[0] : '',
        materialCategory: currentItem.materialCategory || '',
        ownership: currentItem.ownership || '',
        rentalRate: currentItem.rentalRate?.toString() || '',
        rentalPeriod: currentItem.rentalPeriod || '',
        maintenanceDate: currentItem.maintenanceDate ? currentItem.maintenanceDate.split('T')[0] : '',
        serialNumber: currentItem.serialNumber || '',
        condition: currentItem.condition || '',
        estimatedValue: currentItem.estimatedValue?.toString() || '',
        reservePrice: currentItem.reservePrice?.toString() || '',
        dimensions: currentItem.dimensions || '',
        storageLocation: currentItem.storageLocation || '',
      });
    }
  }, [currentItem, isEditMode]);

  const loadProjects = async () => {
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (err: any) {
      setError('Failed to load projects');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }

    // When type changes, update the default status
    if (name === 'type') {
      const newType = value as InventoryItemType;
      let defaultStatus: InventoryStatus;
      switch (newType) {
        case InventoryItemType.MATERIAL:
          defaultStatus = InventoryStatus.IN_STOCK;
          break;
        case InventoryItemType.TOOL:
          defaultStatus = InventoryStatus.AVAILABLE;
          break;
        case InventoryItemType.SALVAGE:
          defaultStatus = InventoryStatus.ESTIMATED;
          break;
      }
      setFormData((prev) => ({ ...prev, status: defaultStatus }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setError(null);

    try {
      const validated = inventorySchema.parse(formData);

      const submitData: any = {
        type: validated.type,
        name: validated.name,
        description: validated.description || undefined,
        quantity: parseFloat(validated.quantity),
        unit: validated.unit,
        status: validated.status,
        projectId: validated.projectId || undefined,
      };

      // Add type-specific fields
      if (validated.type === InventoryItemType.MATERIAL) {
        if (validated.supplier) submitData.supplier = validated.supplier;
        if (validated.purchaseCost) submitData.purchaseCost = parseFloat(validated.purchaseCost);
        if (validated.purchaseDate) submitData.purchaseDate = validated.purchaseDate;
        if (validated.materialCategory) submitData.materialCategory = validated.materialCategory;
      } else if (validated.type === InventoryItemType.TOOL) {
        if (validated.ownership) submitData.ownership = validated.ownership;
        if (validated.rentalRate) submitData.rentalRate = parseFloat(validated.rentalRate);
        if (validated.rentalPeriod) submitData.rentalPeriod = validated.rentalPeriod;
        if (validated.maintenanceDate) submitData.maintenanceDate = validated.maintenanceDate;
        if (validated.serialNumber) submitData.serialNumber = validated.serialNumber;
      } else if (validated.type === InventoryItemType.SALVAGE) {
        if (validated.condition) submitData.condition = validated.condition;
        if (validated.estimatedValue) submitData.estimatedValue = parseFloat(validated.estimatedValue);
        if (validated.reservePrice) submitData.reservePrice = parseFloat(validated.reservePrice);
        if (validated.dimensions) submitData.dimensions = validated.dimensions;
        if (validated.storageLocation) submitData.storageLocation = validated.storageLocation;
      }

      setIsLoading(true);
      if (isEditMode && id) {
        await updateItem(id, submitData);
      } else {
        await createItem(submitData);
      }

      // Navigate back to project if we came from there, otherwise go to inventory list
      if (projectIdFromQuery) {
        navigate(`/projects/${projectIdFromQuery}`);
      } else {
        navigate('/inventory');
      }
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            errors[error.path[0].toString()] = error.message;
          }
        });
        setFormErrors(errors);
      } else {
        setError(err.message || 'Failed to save inventory item');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusOptions = () => {
    switch (formData.type) {
      case InventoryItemType.MATERIAL:
        return [
          { value: InventoryStatus.PURCHASED, label: 'Purchased' },
          { value: InventoryStatus.IN_STOCK, label: 'In Stock' },
          { value: InventoryStatus.CONSUMED, label: 'Consumed' },
        ];
      case InventoryItemType.TOOL:
        return [
          { value: InventoryStatus.AVAILABLE, label: 'Available' },
          { value: InventoryStatus.ASSIGNED, label: 'Assigned' },
          { value: InventoryStatus.IN_USE, label: 'In Use' },
          { value: InventoryStatus.MAINTENANCE, label: 'Maintenance' },
        ];
      case InventoryItemType.SALVAGE:
        return [
          { value: InventoryStatus.ESTIMATED, label: 'Estimated (Pre-extraction)' },
          { value: InventoryStatus.EXTRACTED, label: 'Extracted' },
          { value: InventoryStatus.AVAILABLE_FOR_SALE, label: 'Available for Sale' },
          { value: InventoryStatus.LISTED, label: 'Listed' },
          { value: InventoryStatus.SOLD, label: 'Sold' },
          { value: InventoryStatus.SHIPPED, label: 'Shipped' },
        ];
    }
  };

  if (storeLoading && isEditMode) {
    return <div className="flex items-center justify-center h-64"><p>Loading...</p></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Inventory Item' : 'New Inventory Item'}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {isEditMode ? 'Update the inventory item details' : 'Add a new item to your inventory'}
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Information */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">General Information</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Item Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                disabled={isEditMode}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value={InventoryItemType.MATERIAL}>Material</option>
                <option value={InventoryItemType.TOOL}>Tool</option>
                <option value={InventoryItemType.SALVAGE}>Salvage</option>
              </select>
              {isEditMode && (
                <p className="mt-1 text-xs text-gray-500">Type cannot be changed after creation</p>
              )}
              {formErrors.type && <p className="mt-1 text-sm text-red-600">{formErrors.type}</p>}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
              {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
              {formErrors.quantity && <p className="mt-1 text-sm text-red-600">{formErrors.quantity}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Unit *</label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                placeholder="e.g., lbs, units, hours, sq ft"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
              {formErrors.unit && <p className="mt-1 text-sm text-red-600">{formErrors.unit}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                {getStatusOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {formErrors.status && <p className="mt-1 text-sm text-red-600">{formErrors.status}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Project (Optional)</label>
              <select
                name="projectId"
                value={formData.projectId}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">No project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Material-Specific Fields */}
        {formData.type === InventoryItemType.MATERIAL && (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Material Details</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Supplier</label>
                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <input
                  type="text"
                  name="materialCategory"
                  value={formData.materialCategory}
                  onChange={handleChange}
                  placeholder="e.g., Lumber, Concrete, Disposal"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Purchase Cost</label>
                <input
                  type="number"
                  name="purchaseCost"
                  value={formData.purchaseCost}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Purchase Date</label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tool-Specific Fields */}
        {formData.type === InventoryItemType.TOOL && (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Tool Details</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Ownership</label>
                <select
                  name="ownership"
                  value={formData.ownership}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="">Select...</option>
                  <option value="OWNED">Owned</option>
                  <option value="RENTED">Rented</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Serial Number</label>
                <input
                  type="text"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              {formData.ownership === 'RENTED' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rental Rate</label>
                    <input
                      type="number"
                      name="rentalRate"
                      value={formData.rentalRate}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rental Period</label>
                    <select
                      name="rentalPeriod"
                      value={formData.rentalPeriod}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    >
                      <option value="">Select...</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Last Maintenance Date</label>
                <input
                  type="date"
                  name="maintenanceDate"
                  value={formData.maintenanceDate}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Salvage-Specific Fields */}
        {formData.type === InventoryItemType.SALVAGE && (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Salvage Details</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Condition</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="">Select...</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="As-Is">As-Is</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Storage Location</label>
                <input
                  type="text"
                  name="storageLocation"
                  value={formData.storageLocation}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Estimated Value</label>
                <input
                  type="number"
                  name="estimatedValue"
                  value={formData.estimatedValue}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Reserve Price</label>
                <input
                  type="number"
                  name="reservePrice"
                  value={formData.reservePrice}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Dimensions</label>
                <input
                  type="text"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleChange}
                  placeholder="e.g., 10ft x 5ft x 3ft"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => {
              if (projectIdFromQuery) {
                navigate(`/projects/${projectIdFromQuery}`);
              } else {
                navigate('/inventory');
              }
            }}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : isEditMode ? 'Update Item' : 'Create Item'}
          </button>
        </div>
      </form>
    </div>
  );
}
