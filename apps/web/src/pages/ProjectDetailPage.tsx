import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { Project, ProjectStatus } from '../types/project';
import { useInventoryStore } from '../store/inventoryStore';
import { InventoryItemType, InventoryStatus } from '../types/inventory';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const { items: inventoryItems, fetchItems, deleteItem } = useInventoryStore();
  const [deleteInventoryConfirm, setDeleteInventoryConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadProject(id);
      loadInventory(id);
    }
  }, [id]);

  const loadInventory = async (projectId: string) => {
    await fetchItems({ projectId });
  };

  const loadProject = async (projectId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await projectService.getProject(projectId);
      setProject(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await projectService.deleteProject(id);
      navigate('/projects');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const getStatusLabel = (status: ProjectStatus) => {
    const labels: Record<ProjectStatus, string> = {
      [ProjectStatus.PLANNED]: 'Planned',
      [ProjectStatus.ACTIVE]: 'Active',
      [ProjectStatus.ON_HOLD]: 'On Hold',
      [ProjectStatus.COMPLETED]: 'Completed',
      [ProjectStatus.CANCELLED]: 'Cancelled',
    };
    return labels[status];
  };

  const getStatusBadgeColor = (status: ProjectStatus) => {
    const colors: Record<ProjectStatus, string> = {
      [ProjectStatus.PLANNED]: 'bg-gray-100 text-gray-800',
      [ProjectStatus.ACTIVE]: 'bg-green-100 text-green-800',
      [ProjectStatus.ON_HOLD]: 'bg-yellow-100 text-yellow-800',
      [ProjectStatus.COMPLETED]: 'bg-blue-100 text-blue-800',
      [ProjectStatus.CANCELLED]: 'bg-red-100 text-red-800',
    };
    return colors[status];
  };

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return 'Not set';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDeleteInventory = async (inventoryId: string) => {
    try {
      await deleteItem(inventoryId);
      setDeleteInventoryConfirm(null);
      if (id) {
        loadInventory(id);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete inventory item');
    }
  };

  const getInventoryStatusBadgeColor = (status: InventoryStatus) => {
    const colors: Record<InventoryStatus, string> = {
      [InventoryStatus.PURCHASED]: 'bg-blue-100 text-blue-800',
      [InventoryStatus.IN_STOCK]: 'bg-green-100 text-green-800',
      [InventoryStatus.CONSUMED]: 'bg-gray-100 text-gray-800',
      [InventoryStatus.AVAILABLE]: 'bg-green-100 text-green-800',
      [InventoryStatus.ASSIGNED]: 'bg-yellow-100 text-yellow-800',
      [InventoryStatus.IN_USE]: 'bg-blue-100 text-blue-800',
      [InventoryStatus.MAINTENANCE]: 'bg-orange-100 text-orange-800',
      [InventoryStatus.EXTRACTED]: 'bg-purple-100 text-purple-800',
      [InventoryStatus.AVAILABLE_FOR_SALE]: 'bg-green-100 text-green-800',
      [InventoryStatus.LISTED]: 'bg-blue-100 text-blue-800',
      [InventoryStatus.SOLD]: 'bg-red-100 text-red-800',
      [InventoryStatus.SHIPPED]: 'bg-gray-100 text-gray-800',
    };
    return colors[status];
  };

  const getInventoryStatusLabel = (status: InventoryStatus) => {
    return status.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
  };

  const getInventoryTypeIcon = (type: InventoryItemType) => {
    switch (type) {
      case InventoryItemType.MATERIAL:
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      case InventoryItemType.TOOL:
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case InventoryItemType.SALVAGE:
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><p>Loading...</p></div>;
  }

  if (error || !project) {
    return <div className="text-red-600">{error || 'Project not found'}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/projects" className="text-gray-400 hover:text-gray-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="mt-1 text-sm text-gray-600">Project Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to={`/projects/${project.id}/edit`}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Edit
          </Link>
          {deleteConfirm ? (
            <>
              <button onClick={handleDelete} className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700">
                Confirm Delete
              </button>
              <button onClick={() => setDeleteConfirm(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white">
                Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setDeleteConfirm(true)} className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700">
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500">Project Name</label>
            <p className="mt-1 text-sm text-gray-900">{project.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Status</label>
            <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(project.status)}`}>
              {getStatusLabel(project.status)}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Client</label>
            <p className="mt-1 text-sm text-gray-900">{project.client?.name || 'Unknown'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Estimated Budget</label>
            <p className="mt-1 text-sm text-gray-900">{formatCurrency(project.estimatedBudget)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Actual Cost</label>
            <p className="mt-1 text-sm text-gray-900">{formatCurrency(project.actualCost)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Start Date</label>
            <p className="mt-1 text-sm text-gray-900">{formatDate(project.startDate)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Est. Completion</label>
            <p className="mt-1 text-sm text-gray-900">{formatDate(project.estimatedCompletionDate)}</p>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-500">Description</label>
            <p className="mt-1 text-sm text-gray-900">{project.description || 'No description'}</p>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-500">Location</label>
            <p className="mt-1 text-sm text-gray-900">{project.street1}</p>
            {project.street2 && <p className="text-sm text-gray-900">{project.street2}</p>}
            <p className="text-sm text-gray-900">{project.city}, {project.state} {project.postalCode}</p>
            {project.country !== 'United States' && <p className="text-sm text-gray-900">{project.country}</p>}
          </div>
        </div>
      </div>

      {/* Inventory Section */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Project Inventory</h2>
            <p className="mt-1 text-sm text-gray-600">
              Materials, tools, and salvage items for this project
            </p>
          </div>
          <Link
            to={`/inventory/new?projectId=${project.id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Inventory
          </Link>
        </div>

        {inventoryItems.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No inventory items</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding materials, tools, or salvage items to this project
            </p>
            <div className="mt-6">
              <Link
                to={`/inventory/new?projectId=${project.id}`}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add First Item
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventoryItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-100 rounded-lg text-gray-600">
                          {getInventoryTypeIcon(item.type)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          {item.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {item.type.charAt(0) + item.type.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.quantity} {item.unit}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getInventoryStatusBadgeColor(item.status)}`}>
                        {getInventoryStatusLabel(item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <Link
                        to={`/inventory/${item.id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        View
                      </Link>
                      <Link
                        to={`/inventory/${item.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </Link>
                      {deleteInventoryConfirm === item.id ? (
                        <>
                          <button
                            onClick={() => handleDeleteInventory(item.id)}
                            className="text-red-600 hover:text-red-900 font-semibold"
                          >
                            Confirm?
                          </button>
                          <button
                            onClick={() => setDeleteInventoryConfirm(null)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setDeleteInventoryConfirm(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
