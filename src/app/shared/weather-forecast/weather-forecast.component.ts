import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { Forecast, WeatherService, WeatherType } from "src/app/weather.service";

@Component({
  selector: "app-weather-forecast",
  templateUrl: "./weather-forecast.component.html",
  styleUrls: ["./weather-forecast.component.scss"],
})
export class WeatherForecastComponent implements OnInit {
  @Input() lat: number;
  @Input() lng: number;
  forecast$: Observable<Forecast>;
  weatherType = WeatherType;

  constructor(private weatherService: WeatherService) {}

  ngOnInit() {
    this.forecast$ = this.weatherService.getForecast(this.lat, this.lng);
  }
}
