export interface RegionConfig {
  id: string;
  label: string;
  city: string;
  lat: number;
  lon: number;
  timezone: string;
}

export const REGIONS: RegionConfig[] = [
  {
    id: "northeast",
    label: "Northeast",
    city: "New York, NY",
    lat: 40.7128,
    lon: -74.006,
    timezone: "America/New_York",
  },
  {
    id: "southeast",
    label: "Southeast",
    city: "Atlanta, GA",
    lat: 33.749,
    lon: -84.388,
    timezone: "America/New_York",
  },
  {
    id: "midwest",
    label: "Midwest",
    city: "Chicago, IL",
    lat: 41.8781,
    lon: -87.6298,
    timezone: "America/Chicago",
  },
  {
    id: "southwest",
    label: "Southwest",
    city: "Dallas, TX",
    lat: 32.7767,
    lon: -96.797,
    timezone: "America/Chicago",
  },
  {
    id: "west",
    label: "West",
    city: "Los Angeles, CA",
    lat: 34.0522,
    lon: -118.2437,
    timezone: "America/Los_Angeles",
  },
];

export const WMO_STORM_CODES: Record<number, string> = {
  45: "Fog",
  48: "Icy Fog",
  51: "Light Drizzle",
  53: "Drizzle",
  55: "Heavy Drizzle",
  61: "Light Rain",
  63: "Rain",
  65: "Heavy Rain",
  71: "Light Snow",
  73: "Snow",
  75: "Heavy Snow",
  77: "Snow Grains",
  80: "Showers",
  81: "Heavy Showers",
  82: "Violent Showers",
  85: "Snow Showers",
  86: "Heavy Snow Showers",
  95: "Thunderstorm",
  96: "Thunderstorm w/ Hail",
  99: "Thunderstorm w/ Heavy Hail",
};

export function getStormLabel(code: number): string | null {
  return WMO_STORM_CODES[code] ?? null;
}

export function isSevereStorm(code: number): boolean {
  return code >= 95 || code === 82 || code === 86;
}
