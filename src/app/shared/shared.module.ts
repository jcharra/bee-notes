import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { JournalEntryShortComponent } from './journal-entry-short.component';

@NgModule({
  declarations: [JournalEntryShortComponent],
  imports: [CommonModule],
  exports: [JournalEntryShortComponent]
})
export class SharedModule { }
