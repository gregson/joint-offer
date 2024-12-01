import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface SearchFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
}

interface FilterState {
  searchTerm: string;
  priceRange: [number, number];
  storageRange: [number, number];
  brands: string[];
}

export function SearchFilters({ onFiltersChange }: SearchFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    priceRange: [0, 2000],
    storageRange: [0, 1024],
    brands: [],
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = {
      ...filters,
      searchTerm: e.target.value,
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handlePriceRangeChange = (value: number[]) => {
    const newFilters = {
      ...filters,
      priceRange: value as [number, number],
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleStorageRangeChange = (value: number[]) => {
    const newFilters = {
      ...filters,
      storageRange: value as [number, number],
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    const defaultFilters = {
      searchTerm: '',
      priceRange: [0, 2000],
      storageRange: [0, 1024],
      brands: [],
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  return (
    <div className="space-y-6 p-4 border rounded-lg bg-white shadow-sm">
      <div>
        <Label htmlFor="search">Rechercher</Label>
        <Input
          id="search"
          type="text"
          placeholder="Rechercher un smartphone..."
          value={filters.searchTerm}
          onChange={handleSearchChange}
          className="mt-1"
        />
      </div>

      <div>
        <Label>Prix (€)</Label>
        <Slider
          defaultValue={filters.priceRange}
          max={2000}
          step={50}
          onValueChange={handlePriceRangeChange}
          className="mt-2"
        />
        <div className="flex justify-between mt-1 text-sm text-gray-500">
          <span>{filters.priceRange[0]}€</span>
          <span>{filters.priceRange[1]}€</span>
        </div>
      </div>

      <div>
        <Label>Stockage (GB)</Label>
        <Slider
          defaultValue={filters.storageRange}
          max={1024}
          step={64}
          onValueChange={handleStorageRangeChange}
          className="mt-2"
        />
        <div className="flex justify-between mt-1 text-sm text-gray-500">
          <span>{filters.storageRange[0]}GB</span>
          <span>{filters.storageRange[1]}GB</span>
        </div>
      </div>

      <Button onClick={handleReset} variant="outline" className="w-full">
        Réinitialiser les filtres
      </Button>
    </div>
  );
}
