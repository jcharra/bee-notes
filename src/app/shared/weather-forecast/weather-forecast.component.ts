import { Component, Input, OnInit } from "@angular/core";
import { AnimationController } from "@ionic/angular";
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

  constructor(
    private weatherService: WeatherService,
    private animationCtrl: AnimationController
  ) {}

  ngOnInit() {
    this.forecast$ = this.weatherService.getForecast(this.lat, this.lng);

    const animation = this.animationCtrl
      .create()
      .addElement(document.querySelector(".forecast"))
      .duration(2000)
      .fromTo("opacity", "0", "1");
    animation.play();

    setTimeout(() => {
      const sun = this.animationCtrl
        .create()
        .addElement(document.querySelectorAll(".sunny"))
        .duration(10000)
        .iterations(Infinity)
        .fromTo("transform", "rotate(0deg)", "rotate(360deg)");
      sun.play();
    }, 1000);
  }
}
