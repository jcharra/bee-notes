import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { GroupActionBarComponent } from "./group-action-bar/group-action-bar.component";
import { GroupHeaderComponent } from "./group-header-component/group-header.component";
import { JournalEntryShortComponent } from "./journal-entry-short/journal-entry-short.component";
import { WeatherForecastComponent } from "./weather-forecast/weather-forecast.component";

@NgModule({
  declarations: [
    JournalEntryShortComponent,
    GroupHeaderComponent,
    GroupActionBarComponent,
    WeatherForecastComponent,
  ],
  imports: [CommonModule, TranslateModule],
  exports: [
    JournalEntryShortComponent,
    GroupHeaderComponent,
    GroupActionBarComponent,
    WeatherForecastComponent,
  ],
})
export class SharedModule {}
