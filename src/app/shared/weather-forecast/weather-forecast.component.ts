import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { AnimationService } from "src/app/services/animation.service";
import { Forecast, WeatherService, WeatherType } from "src/app/services/weather.service";

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

  constructor(private weatherService: WeatherService, private animationService: AnimationService) {}

  ngOnInit() {
    this.forecast$ = this.weatherService.getForecast(this.lat, this.lng);
    this.animationService.rotate(".sunny", Infinity);
  }
}
