import { Component, Input, OnInit } from "@angular/core";
import { CountableForEntryType } from "../types/Countable";
import { JournalEntry } from "../types/JournalEntry";

@Component({
  selector: "app-journal-entry-short",
  templateUrl: "./journal-entry-short.component.html",
  styleUrls: ["./journal-entry-short.component.css"],
})
export class JournalEntryShortComponent implements OnInit {
  @Input() entry: JournalEntry;
  amountWithUnit: string;

  constructor() {}

  ngOnInit() {
    const c = CountableForEntryType.get(this.entry.type);
    if (c && (this.entry.amount || this.entry.amount === 0)) {
      this.amountWithUnit =
        this.entry.amount === 1
          ? `1 ${c.unitSingular}`
          : `${this.entry.amount} ${c.unit}`;
    }
  }
}
