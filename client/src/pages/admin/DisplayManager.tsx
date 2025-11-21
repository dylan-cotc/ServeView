import { useState, useEffect } from 'react';
import { Plus, MapPin, Monitor, Settings, Trash2, Edit } from 'lucide-react';
import { adminAPI } from '../../services/api';

interface Location {
  id: number;
  name: string;
  slug: string;
  display_name: string;
  is_primary: boolean;
  timezone: string;
}

interface Display {
  id: number;
  location_id: number;
  name: string;
  slug: string;
  pc_service_type_id?: string;
  service_type_name?: string;
  is_primary: boolean;
  max_people: number;
  assignment_count?: number;
}

export default function DisplayManager() {
  const [activeTab, setActiveTab] = useState<'locations' | 'displays'>('locations');
  const [locations, setLocations] = useState<Location[]>([]);
  const [displays, setDisplays] = useState<Display[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  useEffect(() => {
    fetchLocations();
    fetchDisplays();
  }, []);

  const fetchLocations = async () => {
    try {
      const data = await adminAPI.getLocations();
      setLocations(data);
    } catch (error) {
      console.error('Failed to fetch locations:', error);
    }
  };

  const fetchDisplays = async () => {
    try {
      // For now, we'll get displays from the existing locations endpoint
      // This will be updated when we implement the proper displays API
      const data = await adminAPI.getLocations();
      // Transform locations to displays for now
      const displayData: Display[] = data.flatMap(location =>
        location.pc_service_type_id ? [{
          id: location.id,
          location_id: location.id,
          name: 'Main Display',
          slug: `main-${location.slug}`,
          pc_service_type_id: location.pc_service_type_id,
          service_type_name: location.service_type_name,
          is_primary: location.is_primary,
          max_people: 20,
          assignment_count: 0 // This will be populated from API later
        }] : []
      );
      setDisplays(displayData);
    } catch (error) {
      console.error('Failed to fetch displays:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDisplaysForLocation = (locationId: number) => {
    return displays.filter(display => display.location_id === locationId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Display Manager</h1>
        <p className="text-gray-600 mt-2">Manage locations and their associated displays</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('locations')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'locations'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <MapPin className="w-4 h-4 inline mr-2" />
            Locations
          </button>
          <button
            onClick={() => setActiveTab('displays')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'displays'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Monitor className="w-4 h-4 inline mr-2" />
            Displays
          </button>
        </nav>
      </div>

      {/* Locations Tab */}
      {activeTab === 'locations' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Locations</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors">
              <Plus className="w-4 h-4" />
              Add Location
            </button>
          </div>

          <div className="grid gap-4">
            {locations.map(location => (
              <div key={location.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{location.display_name}</h3>
                      <p className="text-sm text-gray-600">{location.name}</p>
                      <p className="text-xs text-gray-500">Slug: {location.slug}</p>
                    </div>
                    {location.is_primary && (
                      <span className="px-2 py-1 text-xs bg-primary text-white rounded-full">Primary</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {getDisplaysForLocation(location.id).length} display(s)
                    </span>
                    <button className="p-2 text-gray-600 hover:text-primary hover:bg-primary-50 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Displays Tab */}
      {activeTab === 'displays' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Displays</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors">
              <Plus className="w-4 h-4" />
              Add Display
            </button>
          </div>

          <div className="space-y-8">
            {locations.map(location => {
              const locationDisplays = getDisplaysForLocation(location.id);
              if (locationDisplays.length === 0) return null;

              return (
                <div key={location.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900">{location.display_name}</h3>
                    <span className="text-sm text-gray-600">({locationDisplays.length} display{locationDisplays.length !== 1 ? 's' : ''})</span>
                  </div>

                  <div className="grid gap-4">
                    {locationDisplays.map(display => (
                      <div key={display.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Monitor className="w-5 h-5 text-gray-400" />
                            <div>
                              <h4 className="font-medium text-gray-900">{display.name}</h4>
                              <p className="text-sm text-gray-600">Slug: {display.slug}</p>
                              {display.service_type_name && (
                                <p className="text-sm text-gray-600">Service: {display.service_type_name}</p>
                              )}
                            </div>
                            {display.is_primary && (
                              <span className="px-2 py-1 text-xs bg-primary text-white rounded-full">Primary</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                              {display.assignment_count || 0} assignment(s)
                            </span>
                            <button className="p-2 text-gray-600 hover:text-primary hover:bg-primary-50 rounded-lg transition-colors">
                              <Settings className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}