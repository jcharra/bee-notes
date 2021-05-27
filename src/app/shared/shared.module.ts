import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { GroupActionBarComponent } from "./group-action-bar/group-action-bar.component";
import { GroupHeaderComponent } from "./group-header-component/group-header.component";
import { JournalEntryShortComponent } from "./journal-entry-short/journal-entry-short.component";
import { WeatherForecastComponent } from "./weather-forecast/weather-forecast.component";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { QueenColorComponent } from "./queen-color/queen-color.component";

@NgModule({
  declarations: [
    JournalEntryShortComponent,
    GroupHeaderComponent,
    GroupActionBarComponent,
    WeatherForecastComponent,
    QueenColorComponent,
  ],
  imports: [CommonModule, TranslateModule],
  exports: [
    JournalEntryShortComponent,
    GroupHeaderComponent,
    GroupActionBarComponent,
    WeatherForecastComponent,
    QueenColorComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SharedModule {}
