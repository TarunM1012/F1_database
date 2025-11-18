import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';

const DataExport: React.FC = () => {
  const { exportData } = useData();
  const [loading, setLoading] = useState(false);

  const handleExport = async (table: string) => {
    try {
      setLoading(true);
      const data = await exportData(table, 'csv');
      
      // Create and download CSV file
      const blob = new Blob([data], { 
        type: 'text/csv;charset=utf-8;' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${table}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log(`✅ Exported ${table} as CSV`);
    } catch (error: any) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error.message || 'Unknown error'}\n\nPlease check the console for details.`);
    } finally {
      setLoading(false);
    }
  };

  const exportableTables = [
    { name: 'drivers', label: 'Drivers', description: 'Export all driver information' },
    { name: 'constructors', label: 'Constructors', description: 'Export all constructor information' },
    { name: 'races', label: 'Races', description: 'Export all race information' },
    { name: 'results', label: 'Results', description: 'Export all race results' },
    { name: 'circuits', label: 'Circuits', description: 'Export all circuit information' },
    { name: 'qualifying', label: 'Qualifying', description: 'Export qualifying results' },
    { name: 'pit_stops', label: 'Pit Stops', description: 'Export pit stop data' },
    { name: 'lap_times', label: 'Lap Times', description: 'Export lap time data' }
  ];

  return (
    <div className="min-h-screen space-y-6" style={{ backgroundImage: 'url(/background.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Data Export</h1>
        <p className="text-gray-600 mb-2">
          Export Formula 1 database tables as CSV files. All files will download automatically.
        </p>
        <p className="text-sm text-gray-500">
          CSV files can be opened in Excel, Google Sheets, or any spreadsheet application.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Tables</h2>
        
        {loading && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="loading mr-3"></div>
              <p className="text-blue-700">Exporting data, please wait...</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exportableTables.map((table) => (
            <div
              key={table.name}
              className="border border-gray-200 rounded-lg p-4 hover:border-red-500 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{table.label}</h3>
                  <p className="text-sm text-gray-600 mb-3">{table.description}</p>
                </div>
              </div>
              <button
                onClick={() => handleExport(table.name)}
                disabled={loading}
                className="w-full px-4 py-2 text-white rounded transition-colors text-sm font-medium"
                style={{
                  backgroundColor: loading ? 'rgba(220, 38, 38, 0.5)' : '#dc2626',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#b91c1c';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#dc2626';
                  }
                }}
              >
                {loading ? 'Exporting...' : `Export ${table.label}`}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Export Tips</h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• CSV files are compatible with Excel, Google Sheets, and other spreadsheet applications</li>
          <li>• Large tables may take a moment to export</li>
          <li>• Files are automatically downloaded to your default downloads folder</li>
          <li>• Special characters in data are properly escaped for CSV format</li>
        </ul>
      </div>
    </div>
  );
};

export default DataExport;

