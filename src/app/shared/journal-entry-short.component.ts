import { JournalEntry } from '../journal.service';
import { Component, Input, OnInit } from '@angular/core';
import { CountableForEntryType } from '../swarms/swarm-journal/journal-edit-entry/amount';

@Component({
  selector: 'app-journal-entry-short',
  template: `{{ entry.type + (amountWithUnit ? ' (' + amountWithUnit + ')' : '') }}`
})
export class JournalEntryShortComponent implements OnInit {

  @Input() entry: JournalEntry;
  amountWithUnit: string;

  constructor() { }

  ngOnInit() {
    const c = CountableForEntryType.get(this.entry.type);
    if (c) {
      this.amountWithUnit = this.entry.amount === 1 ?
        `1 ${c.unitSingular}` :
        `${this.entry.amount} ${c.unit}`;
    }
  }
}
