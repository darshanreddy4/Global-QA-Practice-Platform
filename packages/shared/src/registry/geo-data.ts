import type { GeoCountry, GeoState, GeoCity } from "../domain-types";

/** Deterministic fictional geo dataset backing the dependent-dropdown flagship challenge. */
export const countries: GeoCountry[] = [
  { code: "IN", name: "India" },
  { code: "US", name: "United States" },
  { code: "DE", name: "Germany" },
];

export const states: GeoState[] = [
  { code: "KA", countryCode: "IN", name: "Karnataka" },
  { code: "MH", countryCode: "IN", name: "Maharashtra" },
  { code: "TN", countryCode: "IN", name: "Tamil Nadu" },
  { code: "CA", countryCode: "US", name: "California" },
  { code: "NY", countryCode: "US", name: "New York" },
  { code: "BY", countryCode: "DE", name: "Bavaria" },
];

export const cities: GeoCity[] = [
  { id: "blr", stateCode: "KA", name: "Bengaluru" },
  { id: "mys", stateCode: "KA", name: "Mysuru" },
  { id: "mng", stateCode: "KA", name: "Mangaluru" },
  { id: "mum", stateCode: "MH", name: "Mumbai" },
  { id: "pun", stateCode: "MH", name: "Pune" },
  { id: "che", stateCode: "TN", name: "Chennai" },
  { id: "coi", stateCode: "TN", name: "Coimbatore" },
  { id: "sfo", stateCode: "CA", name: "San Francisco" },
  { id: "la", stateCode: "CA", name: "Los Angeles" },
  { id: "nyc", stateCode: "NY", name: "New York City" },
  { id: "muc", stateCode: "BY", name: "Munich" },
  { id: "nur", stateCode: "BY", name: "Nuremberg" },
];
