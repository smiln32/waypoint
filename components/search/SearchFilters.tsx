"use client";

export interface JobSearchFilters {
  datePosted: string;
  schedule: string;
  minimumSalary: string;
  radius: string;
}

interface SearchFiltersProps {
  value: JobSearchFilters;
  onChange: (value: JobSearchFilters) => void;
}

export const defaultJobSearchFilters: JobSearchFilters = {
  datePosted: "",
  schedule: "",
  minimumSalary: "",
  radius: "",
};

export function SearchFilters({ value, onChange }: SearchFiltersProps) {
  const update = (field: keyof JobSearchFilters, nextValue: string) => {
    onChange({ ...value, [field]: nextValue });
  };

  return (
    <section className="search-filters" aria-label="Job search filters">
      <label>
        Date posted
        <select
          value={value.datePosted}
          onChange={(event) => update("datePosted", event.target.value)}
        >
          <option value="">Any time</option>
          <option value="1">Past 24 hours</option>
          <option value="7">Past week</option>
          <option value="30">Past month</option>
        </select>
      </label>
      <label>
        Work schedule
        <select
          value={value.schedule}
          onChange={(event) => update("schedule", event.target.value)}
        >
          <option value="">All schedules</option>
          <option value="1">Full-time</option>
          <option value="2">Part-time</option>
        </select>
      </label>
      <label>
        Minimum salary
        <select
          value={value.minimumSalary}
          onChange={(event) => update("minimumSalary", event.target.value)}
        >
          <option value="">Any salary</option>
          <option value="50000">$50,000+</option>
          <option value="75000">$75,000+</option>
          <option value="100000">$100,000+</option>
          <option value="125000">$125,000+</option>
        </select>
      </label>
      <label>
        Distance from location
        <select value={value.radius} onChange={(event) => update("radius", event.target.value)}>
          <option value="">Exact location</option>
          <option value="25">Within 25 miles</option>
          <option value="50">Within 50 miles</option>
          <option value="75">Within 75 miles</option>
          <option value="100">Within 100 miles</option>
        </select>
      </label>
    </section>
  );
}
