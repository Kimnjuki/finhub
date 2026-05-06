import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Filter, Search, X } from "lucide-react";
import { useState } from "react";

interface EventFiltersProps {
  onFiltersChange: (filters: EventFilters) => void;
  activeFilters: EventFilters;
}

export interface EventFilters {
  category?: string;
  impact?: string;
  country?: string;
  search?: string;
  dateRange?: string;
}

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'macro', label: 'Macro Events' },
  { value: 'crypto', label: 'Crypto Events' },
  { value: 'earnings', label: 'Earnings' },
  { value: 'other', label: 'Other' }
];

const impacts = [
  { value: 'all', label: 'All Impact Levels' },
  { value: 'high', label: 'High Impact' },
  { value: 'medium', label: 'Medium Impact' },
  { value: 'low', label: 'Low Impact' }
];

const countries = [
  { value: 'all', label: 'All Countries' },
  { value: 'US', label: 'United States' },
  { value: 'EU', label: 'European Union' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'KE', label: 'Kenya' },
  { value: 'NG', label: 'Nigeria' },
  { value: 'ZA', label: 'South Africa' },
  { value: 'CN', label: 'China' },
  { value: 'JP', label: 'Japan' }
];

export const EventFilters = ({ onFiltersChange, activeFilters }: EventFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState(activeFilters.search || '');

  const updateFilter = (key: keyof EventFilters, value: string) => {
    const newFilters = { ...activeFilters };
    if (value === 'all' || value === '') {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  return (
    <div className="space-y-4 p-6 bg-card rounded-lg border shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <h3 className="font-semibold">Filter Events</h3>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              updateFilter('search', e.target.value);
            }}
            className="pl-9"
          />
        </div>

        {/* Category Filter */}
        <Select
          value={activeFilters.category || 'all'}
          onValueChange={(value) => updateFilter('category', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Impact Filter */}
        <Select
          value={activeFilters.impact || 'all'}
          onValueChange={(value) => updateFilter('impact', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Impact Level" />
          </SelectTrigger>
          <SelectContent>
            {impacts.map((impact) => (
              <SelectItem key={impact.value} value={impact.value}>
                {impact.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Country Filter */}
        <Select
          value={activeFilters.country || 'all'}
          onValueChange={(value) => updateFilter('country', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country.value} value={country.value}>
                {country.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2">
          {activeFilters.category && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Category: {categories.find(c => c.value === activeFilters.category)?.label}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('category', 'all')}
              />
            </Badge>
          )}
          {activeFilters.impact && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Impact: {impacts.find(i => i.value === activeFilters.impact)?.label}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('impact', 'all')}
              />
            </Badge>
          )}
          {activeFilters.country && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Country: {countries.find(c => c.value === activeFilters.country)?.label}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('country', 'all')}
              />
            </Badge>
          )}
          {activeFilters.search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: "{activeFilters.search}"
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('search', '')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};