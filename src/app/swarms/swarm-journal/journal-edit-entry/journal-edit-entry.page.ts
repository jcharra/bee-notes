import { EntryType } from './../../../journal.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-journal-edit-entry',
  templateUrl: './journal-edit-entry.page.html',
  styleUrls: ['./journal-edit-entry.page.scss'],
})
export class JournalEditEntryPage implements OnInit {
  entryId: string;
  type: string;
  typeOptions: EntryType[];
  actionType: EntryType;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.entryId = this.route.snapshot.queryParams.entryId;
    this.type = this.route.snapshot.queryParams.type;

    const options: EntryType[] = [];
    for (const k: string of Object.keys(EntryType)) {
      const et = EntryType[k];
      options.push(et);
    }
    this.typeOptions = options;
  }

  showValue() {
    console.log('Changed to ', this.actionType);
  }
}
