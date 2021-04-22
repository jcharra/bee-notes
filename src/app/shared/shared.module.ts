import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { GroupHeaderComponent } from "./group-header.component";
import { JournalEntryShortComponent } from "./journal-entry-short.component";

@NgModule({
  declarations: [JournalEntryShortComponent, GroupHeaderComponent],
  imports: [CommonModule, TranslateModule],
  exports: [JournalEntryShortComponent, GroupHeaderComponent],
})
export class SharedModule {}
