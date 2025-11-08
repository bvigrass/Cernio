import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { Project, ProjectStatus } from '../types/project';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      loadProject(id);
    }
  }, [id]);

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
    </div>
  );
}
