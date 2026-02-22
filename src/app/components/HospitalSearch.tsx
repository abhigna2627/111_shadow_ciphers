import { useState } from 'react';
import { searchHospital, addHospital } from '../lib/api';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Search, Plus, MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    hospital?: string;
    road?: string;
    city?: string;
    state?: string;
  };
}

interface HospitalSearchProps {
  onHospitalAdded: () => void;
  onClose: () => void;
}

export default function HospitalSearch({ onHospitalAdded, onClose }: HospitalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<number | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    setLoading(true);
    try {
      const data = await searchHospital(query);
      setResults(data);
      if (data.length === 0) {
        toast.info('No hospitals found. Try searching with city name (e.g., "Apollo Hospital Mumbai")');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search temporarily unavailable. You can manually add a hospital below.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHospital = async (result: SearchResult) => {
    setAdding(result.place_id);
    try {
      const hospitalName = result.address.hospital || result.display_name.split(',')[0];
      
      console.log('Adding hospital:', {
        name: hospitalName,
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        contact: 'N/A',
        address: result.display_name
      });
      
      await addHospital({
        name: hospitalName,
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        contact: 'N/A',
        address: result.display_name,
      });
      
      toast.success(`${hospitalName} added successfully!`);
      onHospitalAdded();
      onClose();
    } catch (error) {
      console.error('Add hospital error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to add hospital: ${errorMessage}`);
    } finally {
      setAdding(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search for hospitals (e.g., Apollo Hospital Bangalore)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            'Search'
          )}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {results.map((result) => (
            <Card key={result.place_id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <h3 className="font-semibold text-base leading-tight">
                        {result.address.hospital || result.display_name.split(',')[0]}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-2 pl-6">
                      {result.display_name}
                    </p>
                    <div className="flex gap-4 text-xs text-gray-500 pl-6">
                      <span>Lat: {parseFloat(result.lat).toFixed(4)}</span>
                      <span>Lng: {parseFloat(result.lon).toFixed(4)}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddHospital(result)}
                    disabled={adding === result.place_id}
                    className="flex-shrink-0"
                  >
                    {adding === result.place_id ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}