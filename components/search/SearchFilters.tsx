"use client";

export function SearchFilters() {
  return (
    <section className="search-filters" aria-label="Job search filters">
      <label>
        Date posted
        <select>
          <option>Any time</option>
          <option>Past 24 hours</option>
          <option>Past week</option>
          <option>Past month</option>
        </select>
      </label>
      <label>
        Workplace
        <select>
          <option>All workplaces</option>
          <option>Remote</option>
          <option>Hybrid</option>
          <option>On-site</option>
        </select>
      </label>
      <label>
        Experience
        <select>
          <option>All levels</option>
          <option>Entry level</option>
          <option>Mid-level</option>
          <option>Manager</option>
          <option>Director</option>
        </select>
      </label>
      <label>
        Job type
        <select>
          <option>All types</option>
          <option>Full-time</option>
          <option>Part-time</option>
          <option>Contract</option>
        </select>
      </label>
      <label>
        Minimum pay
        <select>
          <option>Any salary</option>
          <option>$60,000+</option>
          <option>$80,000+</option>
          <option>$100,000+</option>
        </select>
      </label>
      <label className="check-filter">
        <input type="checkbox" /> Quick apply only
      </label>
    </section>
  );
}
