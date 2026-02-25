import { NextResponse } from "next/server";
import { REGIONS, getStormLabel, isSevereStorm } from "@/lib/utils/regions";
import { saturdayToWeekRanges, getMostRecentSaturday } from "@/lib/utils/dates";
import type { WeatherApiResponse, WeekSummary } from "@/types/weather";

const BASE_URL = "https://archive-api.open-meteo.com/v1/archive";

interface OpenMeteoResponse {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    snowfall_sum: number[];
    weather_code: number[];
  };
}

async function fetchWeekData(
  lat: number,
  lon: number,
  timezone: string,
  startDate: string,
  endDate: string
): Promise<WeekSummary> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    start_date: startDate,
    end_date: endDate,
    daily: "temperature_2m_max,temperature_2m_min,snowfall_sum,weather_code",
    temperature_unit: "fahrenheit",
    precipitation_unit: "inch",
    timezone,
  });

  try {
    const res = await fetch(`${BASE_URL}?${params}`, {
      next: { revalidate: 21600 }, // 6 hours
    });
    if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
    const data: OpenMeteoResponse = await res.json();
    const d = data.daily;

    const temps = d.temperature_2m_max.filter((v) => v !== null);
    const mins = d.temperature_2m_min.filter((v) => v !== null);
    const snows = d.snowfall_sum.filter((v) => v !== null);
    const codes = d.weather_code.filter((v) => v !== null);

    const avgMax = temps.length ? temps.reduce((a, b) => a + b, 0) / temps.length : 0;
    const avgMin = mins.length ? mins.reduce((a, b) => a + b, 0) / mins.length : 0;
    const avgTemp = (avgMax + avgMin) / 2;
    const minTemp = mins.length ? Math.min(...mins) : 0;
    const maxTemp = temps.length ? Math.max(...temps) : 0;
    const totalSnow = snows.reduce((a, b) => a + b, 0);
    const dominantCode = codes.length
      ? codes.reduce((a, b) => (a > b ? a : b), 0)
      : 0;

    return {
      startDate,
      endDate,
      avgTempF: Math.round(avgTemp * 10) / 10,
      minTempF: Math.round(minTemp * 10) / 10,
      maxTempF: Math.round(maxTemp * 10) / 10,
      totalSnowfallInches: Math.round(totalSnow * 10) / 10,
      dominantWeatherCode: dominantCode,
      hasSevereStorm: codes.some(isSevereStorm),
      stormLabel: getStormLabel(dominantCode),
    };
  } catch {
    return {
      startDate,
      endDate,
      avgTempF: 0,
      minTempF: 0,
      maxTempF: 0,
      totalSnowfallInches: 0,
      dominantWeatherCode: 0,
      hasSevereStorm: false,
      stormLabel: null,
    };
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const weekEndParam = searchParams.get("weekEnd");
  const saturday = weekEndParam
    ? new Date(`${weekEndParam}T12:00:00`)
    : getMostRecentSaturday();
  const ranges = saturdayToWeekRanges(saturday);

  const regionPromises = REGIONS.map(async (region) => {
    const [lastWeek, previousWeek, sameWeekLastYear] = await Promise.all([
      fetchWeekData(
        region.lat,
        region.lon,
        region.timezone,
        ranges.lastWeek.start,
        ranges.lastWeek.end
      ),
      fetchWeekData(
        region.lat,
        region.lon,
        region.timezone,
        ranges.previousWeek.start,
        ranges.previousWeek.end
      ),
      fetchWeekData(
        region.lat,
        region.lon,
        region.timezone,
        ranges.sameWeekLastYear.start,
        ranges.sameWeekLastYear.end
      ),
    ]);

    return {
      regionId: region.id,
      regionLabel: region.label,
      city: region.city,
      lat: region.lat,
      lon: region.lon,
      weeks: { lastWeek, previousWeek, sameWeekLastYear },
    };
  });

  const regions = await Promise.all(regionPromises);

  const response: WeatherApiResponse = {
    generatedAt: new Date().toISOString(),
    regions,
  };

  return NextResponse.json(response, {
    headers: { "Cache-Control": "s-maxage=21600, stale-while-revalidate=86400" },
  });
}
