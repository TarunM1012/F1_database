import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

interface Driver {
  driverId: number;
  forename: string;
  surname: string;
  nationality: string;
  number?: number;
  code?: string;
  dob?: string;
}

interface Constructor {
  constructorId: number;
  name: string;
  nationality: string;
  constructorRef?: string;
}

const CRUD: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'drivers' | 'constructors'>('drivers');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [constructors, setConstructors] = useState<Constructor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const isAdmin = user?.role === 'admin';

  const fetchData = async () => {
    setLoading(true);
    try {
      const offset = (currentPage - 1) * limit;
      const searchParam = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '';
      
      if (activeTab === 'drivers') {
        const response = await api.get(`/crud/drivers?limit=${limit}&offset=${offset}${searchParam}`);
        if (response.data.success) {
          setDrivers(response.data.data);
          // Get total count from API response
          setTotalCount(response.data.total || 0);
        }
      } else {
        const response = await api.get(`/crud/constructors?limit=${limit}&offset=${offset}${searchParam}`);
        if (response.data.success) {
          setConstructors(response.data.data);
          // Get total count from API response
          setTotalCount(response.data.total || 0);
        }
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when switching tabs
    setSearchTerm(''); // Clear search when switching tabs
  }, [activeTab]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, currentPage, searchTerm]);

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData(item);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    setError(''); // Clear any previous errors
    setSuccess(''); // Clear any previous success messages
    
    try {
      const endpoint = activeTab === 'drivers' ? `/crud/drivers/${id}` : `/crud/constructors/${id}`;
      const response = await api.delete(endpoint);
      if (response.data.success) {
        setSuccess('Item deleted successfully');
        // Refresh the list immediately
        await fetchData();
        // Keep success message visible for 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to delete item');
      setSuccess(''); // Clear success on error
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Clear any previous errors
    setSuccess(''); // Clear any previous success messages
    
    try {
      if (editingItem) {
        // Update existing item
        const endpoint = activeTab === 'drivers' 
          ? `/crud/drivers/${editingItem.driverId}` 
          : `/crud/constructors/${editingItem.constructorId}`;
        const response = await api.put(endpoint, formData);
        if (response.data.success) {
          setSuccess('Item updated successfully');
          setShowForm(false);
          setEditingItem(null);
          setFormData({});
          // Refresh the list immediately
          await fetchData();
          // Keep success message visible for 3 seconds
          setTimeout(() => setSuccess(''), 3000);
        }
      } else {
        // Create new item
        const endpoint = activeTab === 'drivers' ? '/crud/drivers' : '/crud/constructors';
        const response = await api.post(endpoint, formData);
        if (response.data.success) {
          setSuccess('Item created successfully! The list will refresh...');
          setShowForm(false);
          setEditingItem(null);
          setFormData({});
          // Refresh the list immediately
          await fetchData();
          // Keep success message visible for 3 seconds
          setTimeout(() => setSuccess(''), 3000);
        }
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to save item');
      setSuccess(''); // Clear success on error
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormData({});
    setError('');
    setSuccess('');
    // Refresh list when closing form to ensure it's up to date
    fetchData();
  };

  return (
    <div className="views-layout" style={{ backgroundImage: 'url(/background.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      {/* Sidebar */}
      <div className={`views-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Data Management</h2>
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="sidebar-toggle"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? '⟩' : '⟨'}
          </button>
        </div>

        {!sidebarCollapsed && (
          <>
            <p className="sidebar-subtitle">
              Manage Formula 1 Data {!isAdmin && '(Read-only)'}
            </p>

            <div className="sidebar-views">
              <button
                onClick={() => setActiveTab('drivers')}
                className={`view-item ${activeTab === 'drivers' ? 'active' : ''}`}
              >
                <div>
                  <div className="view-item-name">Drivers</div>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('constructors')}
                className={`view-item ${activeTab === 'constructors' ? 'active' : ''}`}
              >
                <div>
                  <div className="view-item-name">Constructors</div>
                </div>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="views-content">
        <div className="content-header">
          <div>
            <h1 className="content-title">
              {activeTab === 'drivers' ? 'Drivers' : 'Constructors'}
            </h1>
            <p className="content-subtitle">
              {activeTab === 'drivers' 
                ? 'Create, Read, Update, and Delete driver records' 
                : 'Create, Read, Update, and Delete constructor records'}
              {!isAdmin && <span className="text-red-600 ml-2">(Read-only for non-admin users)</span>}
            </p>
          </div>
        </div>

        <div className="content-body">
          {error && (
            <div className="alert-error mx-6 my-4">
              {error}
            </div>
          )}

          {success && (
            <div className="alert-success mx-6 my-4">
              {success}
            </div>
          )}

      <div className="bg-white rounded-lg shadow mx-6 my-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-gray-600 mt-1">
                Showing {((currentPage - 1) * limit) + 1}-{Math.min(currentPage * limit, totalCount)} of {totalCount} total
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                Add New {activeTab === 'drivers' ? 'Driver' : 'Constructor'}
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to page 1 when searching
              }}
              className="form-input"
              style={{ maxWidth: '300px' }}
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="btn-secondary ml-2 text-sm"
              >
                Clear
              </button>
            )}
          </div>

          {showForm && (
            <div className="border border-gray-200 rounded-lg p-4 mb-6 bg-white">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {editingItem ? 'Edit' : 'Add New'} {activeTab === 'drivers' ? 'Driver' : 'Constructor'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === 'drivers' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Forename</label>
                      <input
                        type="text"
                        required
                        value={formData.forename || ''}
                        onChange={(e) => setFormData({...formData, forename: e.target.value})}
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Surname</label>
                      <input
                        type="text"
                        required
                        value={formData.surname || ''}
                        onChange={(e) => setFormData({...formData, surname: e.target.value})}
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nationality</label>
                      <input
                        type="text"
                        required
                        value={formData.nationality || ''}
                        onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Number</label>
                      <input
                        type="number"
                        value={formData.number ?? ''}
                        onChange={(e) => setFormData({...formData, number: e.target.value ? Number(e.target.value) : null})}
                        className="form-input"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name || ''}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nationality</label>
                      <input
                        type="text"
                        required
                        value={formData.nationality || ''}
                        onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                        className="form-input"
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : editingItem ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="w-full">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Nationality</th>
                    {activeTab === 'drivers' && <th>Number</th>}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTab === 'drivers' ? 
                    drivers.map((item) => (
                      <tr key={item.driverId}>
                        <td>{`${item.forename} ${item.surname}`}</td>
                        <td>{item.nationality}</td>
                        <td>{item.number || '-'}</td>
                        <td>
                          {isAdmin ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(item)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(item.driverId)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Read-only</span>
                          )}
                        </td>
                      </tr>
                    )) :
                    constructors.map((item) => (
                      <tr key={item.constructorId}>
                        <td>{item.name}</td>
                        <td>{item.nationality}</td>
                        <td>-</td>
                        <td>
                          {isAdmin ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(item)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(item.constructorId)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Read-only</span>
                          )}
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && totalCount > limit && (
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {Math.ceil(totalCount / limit)}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalCount / limit), prev + 1))}
                  disabled={currentPage >= Math.ceil(totalCount / limit)}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* form is inline above table now */}
    </div>
    </div>
  );
};

export default CRUD;