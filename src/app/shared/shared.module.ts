import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { GroupActionBarComponent } from "./group-action-bar/group-action-bar.component";
import { GroupHeaderComponent } from "./group-header-component/group-header.component";
import { JournalEntryShortComponent } from "./journal-entry-short/journal-entry-short.component";
import { WeatherForecastComponent } from "./weather-forecast/weather-forecast.component";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { QueenColorComponent } from "./queen-color/queen-color.component";
import { ColonyDetailsCardComponent } from "./colony-details-card/colony-details-card.component";
import { CrownComponent } from "./crown/crown.component";
import { MiteComponent } from "./mite/mite.component";
import { StatusIndicatorComponent } from "./status-indicator/status-indicator.component";

@NgModule({
  declarations: [
    JournalEntryShortComponent,
    GroupHeaderComponent,
    GroupActionBarComponent,
    WeatherForecastComponent,
    QueenColorComponent,
    ColonyDetailsCardComponent,
    CrownComponent,
    MiteComponent,
    StatusIndicatorComponent,
  ],
  imports: [CommonModule, TranslateModule],
  exports: [
    JournalEntryShortComponent,
    GroupHeaderComponent,
    GroupActionBarComponent,
    WeatherForecastComponent,
    QueenColorComponent,
    ColonyDetailsCardComponent,
    CrownComponent,
    MiteComponent,
    StatusIndicatorComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SharedModule {}
