import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { GroupActionBarComponent } from "./group-action-bar/group-action-bar.component";
import { GroupHeaderComponent } from "./group-header-component/group-header.component";
import { JournalEntryShortComponent } from "./journal-entry-short/journal-entry-short.component";

@NgModule({
  declarations: [
    JournalEntryShortComponent,
    GroupHeaderComponent,
    GroupActionBarComponent,
  ],
  imports: [CommonModule, TranslateModule],
  exports: [
    JournalEntryShortComponent,
    GroupHeaderComponent,
    GroupActionBarComponent,
  ],
})
export class SharedModule {}
