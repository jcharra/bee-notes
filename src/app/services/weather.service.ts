import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { isSameDay, startOfDay } from "date-fns";
import { Observable, of } from "rxjs";
import { map, tap } from "rxjs/operators";

// insert your own key here to retrieve weather forecast information
const API_KEY = "MY_OPENWEATHER_API_KEY";

export enum WeatherType {
  CLEAR = "Clear",
  RAIN = "Rain",
  CLOUDS = "Clouds",
  SNOW = "Snow",
}

export interface Weather {
  main: WeatherType;
}

export interface CurrentData {
  dt: number;
  date?: Date;
  temp: number;
  weather: Weather[];
}

export interface ForecastData {
  dt: number;
  date?: Date;
  temp: {
    min: number;
    max: number;
  };
  weather: Weather[];
}

export interface Forecast {
  current: CurrentData;
  daily: ForecastData[];
}

@Injectable({
  providedIn: "root",
})
export class WeatherService {
  constructor(private http: HttpClient) {}

  private cache = new Map<string, Forecast>();

  getForecast(lat: number, lng: number): Observable<Forecast> {
    const cacheKey = lat + "_" + lng;
    const cachedValue = this.cache.get(cacheKey);
    if (cachedValue && isSameDay(cachedValue.current.date, startOfDay(new Date()))) {
      return of(cachedValue);
    }

    return this.http
      .get<Forecast>(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric&exclude=hourly,minutely,alerts`
      )
      .pipe(
        map((fc: Forecast) => {
          fc.daily.forEach((d) => {
            d.date = new Date(d.dt * 1000);
            d.temp.min = Math.round(d.temp.min);
            d.temp.max = Math.round(d.temp.max);
          });

          fc.current.date = new Date(fc.current.dt * 1000);
          return fc;
        }),
        tap((fc: Forecast) => {
          this.cache.set(cacheKey, fc);
          return fc;
        })
      );
  }
}
