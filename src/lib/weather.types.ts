export interface DailyWeather {
  date: string;
  dayName: string;
  tempMaxC: number;
  tempMaxF: number;
  rainChance: number;
  humidity: number;
  sunrise: string;
  sunset: string;
  score: number;
  ratingLabel: string;
}

export interface WeatherForecast {
  location: string;
  days: DailyWeather[];
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationResult {
  id: number;
  name: string;
  label: string;
  latitude: number;
  longitude: number;
}
