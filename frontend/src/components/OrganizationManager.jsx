import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchOrganizations,
  createOrganization,
  renameOrganization,
  deleteOrganization,
  clearError
} from '../features/organizations/organizationsSlice';

export default function OrganizationManager() {
  const dispatch = useDispatch();
  const { organizations, loading, error } = useSelector((s) => s.organizations);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newOrgName, setNewOrgName] = useState('');
  const [editOrgName, setEditOrgName] = useState('');

  useEffect(() => {
    dispatch(fetchOrganizations());
  }, [dispatch]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    try {
      await dispatch(createOrganization({ name: newOrgName })).unwrap();
      setNewOrgName('');
      setIsCreating(false);
    } catch (err) {
      console.error('Failed to create organization:', err);
    }
  };

  const handleRename = async (id) => {
    if (!editOrgName.trim()) return;

    try {
      await dispatch(renameOrganization({ id, name: editOrgName })).unwrap();
      setEditingId(null);
      setEditOrgName('');
    } catch (err) {
      console.error('Failed to rename organization:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this organization?')) return;

    try {
      await dispatch(deleteOrganization(id)).unwrap();
    } catch (err) {
      console.error('Failed to delete organization:', err);
    }
  };

  const startEdit = (org) => {
    setEditingId(org._id);
    setEditOrgName(org.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditOrgName('');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Organizations</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          + New Organization
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex justify-between items-center">
          <span>{error.message}</span>
          <button onClick={() => dispatch(clearError())} className="text-red-800 hover:text-red-900">
            ✕
          </button>
        </div>
      )}

      {/* Create new organization form */}
      {isCreating && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="text-lg font-medium mb-3">Create New Organization</h3>
          <form onSubmit={handleCreate} className="flex gap-2">
            <input
              type="text"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              placeholder="Organization name"
              className="flex-1 h-10 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setNewOrgName('');
              }}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Organizations list */}
      {loading && organizations.length === 0 ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading organizations...</p>
        </div>
      ) : organizations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No organizations yet. Create your first one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {organizations.map((org) => (
            <div
              key={org._id}
              className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors duration-200"
            >
              {editingId === org._id ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editOrgName}
                    onChange={(e) => setEditOrgName(e.target.value)}
                    className="flex-1 h-10 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={() => handleRename(org._id)}
                    disabled={loading}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {org.name}
                      {org.isDefault && (
                        <span className="ml-2 inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          Default
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {org.members?.length || 1} member{(org.members?.length || 1) !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(org)}
                      className="text-blue-500 hover:text-blue-600 font-medium py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                    >
                      Rename
                    </button>
                    {!org.isDefault && (
                      <button
                        onClick={() => handleDelete(org._id)}
                        className="text-red-500 hover:text-red-600 font-medium py-2 px-3 rounded-lg hover:bg-red-50 transition-colors duration-200"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
