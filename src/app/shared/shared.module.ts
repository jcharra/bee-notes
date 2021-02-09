import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { JournalEntryShortComponent } from "./journal-entry-short.component";

@NgModule({
  declarations: [JournalEntryShortComponent],
  imports: [CommonModule, TranslateModule],
  exports: [JournalEntryShortComponent],
})
export class SharedModule {}
