import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { projectService } from '../services/projectService';
import { clientService } from '../services/clientService';
import { ProjectStatus } from '../types/project';
import { Client } from '../types/client';

const projectSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  status: z.nativeEnum(ProjectStatus),
  imageUrl: z.string().optional(),
  street1: z.string().min(1, 'Street address is required'),
  street2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State/Province is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  startDate: z.string().optional(),
  estimatedCompletionDate: z.string().optional(),
  actualCompletionDate: z.string().optional(),
  estimatedBudget: z.string().optional(),
  actualCost: z.string().optional(),
});

export default function ProjectFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    clientId: '',
    name: '',
    description: '',
    status: ProjectStatus.PLANNED,
    imageUrl: '',
    street1: '',
    street2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    startDate: '',
    estimatedCompletionDate: '',
    actualCompletionDate: '',
    estimatedBudget: '',
    actualCost: '',
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadClients();
    if (isEditMode && id) {
      loadProject(id);
    }
  }, [id, isEditMode]);

  const loadClients = async () => {
    try {
      const data = await clientService.getClients();
      setClients(data);
    } catch (err: any) {
      setError('Failed to load clients');
    }
  };

  const loadProject = async (projectId: string) => {
    try {
      setIsLoading(true);
      const project = await projectService.getProject(projectId);
      setFormData({
        clientId: project.clientId,
        name: project.name,
        description: project.description || '',
        status: project.status,
        imageUrl: project.imageUrl || '',
        street1: project.street1,
        street2: project.street2 || '',
        city: project.city,
        state: project.state,
        postalCode: project.postalCode,
        country: project.country,
        startDate: project.startDate ? project.startDate.split('T')[0] : '',
        estimatedCompletionDate: project.estimatedCompletionDate ? project.estimatedCompletionDate.split('T')[0] : '',
        actualCompletionDate: project.actualCompletionDate ? project.actualCompletionDate.split('T')[0] : '',
        estimatedBudget: project.estimatedBudget?.toString() || '',
        actualCost: project.actualCost?.toString() || '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setError(null);

    try {
      projectSchema.parse(formData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            errors[error.path[0].toString()] = error.message;
          }
        });
        setFormErrors(errors);
        return;
      }
    }

    try {
      setIsLoading(true);
      const projectData: any = {
        clientId: formData.clientId,
        name: formData.name,
        description: formData.description || undefined,
        status: formData.status,
        imageUrl: formData.imageUrl || undefined,
        street1: formData.street1,
        street2: formData.street2 || undefined,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
        startDate: formData.startDate || undefined,
        estimatedCompletionDate: formData.estimatedCompletionDate || undefined,
        actualCompletionDate: formData.actualCompletionDate || undefined,
        estimatedBudget: formData.estimatedBudget ? parseFloat(formData.estimatedBudget) : undefined,
        actualCost: formData.actualCost ? parseFloat(formData.actualCost) : undefined,
      };

      if (isEditMode && id) {
        await projectService.updateProject(id, projectData);
      } else {
        await projectService.createProject(projectData);
      }
      navigate('/projects');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          `Failed to ${isEditMode ? 'update' : 'create'} project`
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && isEditMode) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Loading project...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Project' : 'New Project'}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {isEditMode
            ? 'Update project information'
            : 'Create a new demolition project'}
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client */}
            <div className="md:col-span-2">
              <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-1">
                Client *
              </label>
              <select
                id="clientId"
                name="clientId"
                required
                value={formData.clientId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  formErrors.clientId ? 'border-red-300' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
              >
                <option value="">Select a client...</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
              {formErrors.clientId && (
                <p className="mt-1 text-sm text-red-600">{formErrors.clientId}</p>
              )}
            </div>

            {/* Project Name */}
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Project Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  formErrors.name ? 'border-red-300' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                placeholder="Downtown Building Demolition"
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                id="status"
                name="status"
                required
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value={ProjectStatus.PLANNED}>Planned</option>
                <option value={ProjectStatus.ACTIVE}>Active</option>
                <option value={ProjectStatus.ON_HOLD}>On Hold</option>
                <option value={ProjectStatus.COMPLETED}>Completed</option>
                <option value={ProjectStatus.CANCELLED}>Cancelled</option>
              </select>
            </div>

            {/* Image URL */}
            <div className="md:col-span-2">
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Project Image URL (Optional)
              </label>
              <input
                id="imageUrl"
                name="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="https://example.com/project-photo.jpg"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Project details, scope of work, special requirements..."
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Project Location
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="street1" className="block text-sm font-medium text-gray-700 mb-1">
                Street Address *
              </label>
              <input
                id="street1"
                name="street1"
                type="text"
                required
                value={formData.street1}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  formErrors.street1 ? 'border-red-300' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                placeholder="123 Main Street"
              />
              {formErrors.street1 && (
                <p className="mt-1 text-sm text-red-600">{formErrors.street1}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="street2" className="block text-sm font-medium text-gray-700 mb-1">
                Street Address 2 (Optional)
              </label>
              <input
                id="street2"
                name="street2"
                type="text"
                value={formData.street2}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Suite 100, Building B, etc."
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                id="city"
                name="city"
                type="text"
                required
                value={formData.city}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  formErrors.city ? 'border-red-300' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                placeholder="New York"
              />
              {formErrors.city && (
                <p className="mt-1 text-sm text-red-600">{formErrors.city}</p>
              )}
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State/Province *
              </label>
              <input
                id="state"
                name="state"
                type="text"
                required
                value={formData.state}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  formErrors.state ? 'border-red-300' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                placeholder="NY"
              />
              {formErrors.state && (
                <p className="mt-1 text-sm text-red-600">{formErrors.state}</p>
              )}
            </div>

            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code *
              </label>
              <input
                id="postalCode"
                name="postalCode"
                type="text"
                required
                value={formData.postalCode}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  formErrors.postalCode ? 'border-red-300' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                placeholder="10001"
              />
              {formErrors.postalCode && (
                <p className="mt-1 text-sm text-red-600">{formErrors.postalCode}</p>
              )}
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                Country *
              </label>
              <input
                id="country"
                name="country"
                type="text"
                required
                value={formData.country}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  formErrors.country ? 'border-red-300' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                placeholder="United States"
              />
              {formErrors.country && (
                <p className="mt-1 text-sm text-red-600">{formErrors.country}</p>
              )}
            </div>
          </div>
        </div>

        {/* Timeline & Budget */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Timeline & Budget
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="estimatedCompletionDate" className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Completion
              </label>
              <input
                id="estimatedCompletionDate"
                name="estimatedCompletionDate"
                type="date"
                value={formData.estimatedCompletionDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="actualCompletionDate" className="block text-sm font-medium text-gray-700 mb-1">
                Actual Completion
              </label>
              <input
                id="actualCompletionDate"
                name="actualCompletionDate"
                type="date"
                value={formData.actualCompletionDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="estimatedBudget" className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Budget ($)
              </label>
              <input
                id="estimatedBudget"
                name="estimatedBudget"
                type="number"
                step="0.01"
                min="0"
                value={formData.estimatedBudget}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="50000.00"
              />
            </div>

            <div>
              <label htmlFor="actualCost" className="block text-sm font-medium text-gray-700 mb-1">
                Actual Cost ($)
              </label>
              <input
                id="actualCost"
                name="actualCost"
                type="number"
                step="0.01"
                min="0"
                value={formData.actualCost}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="45000.00"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400"
          >
            {isLoading
              ? 'Saving...'
              : isEditMode
              ? 'Update Project'
              : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
}
