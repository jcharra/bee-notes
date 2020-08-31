import { EntryType } from './../../../journal.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
  entryForm: FormGroup;

  constructor(private route: ActivatedRoute,
    private formBuilder: FormBuilder) {
    this.entryForm = this.formBuilder.group({
      actionType: [null, Validators.required]
    });
  }

  logForm() {
    console.log(this.entryForm.value);
  }

  ngOnInit() {
    this.entryId = this.route.snapshot.queryParams.entryId;
    this.type = this.route.snapshot.queryParams.type;

    const options: EntryType[] = [];
    for (const k of Object.keys(EntryType)) {
      const et = EntryType[k];
      if (!this.type || et.toString().toLowerCase().indexOf(this.type) > -1) {
        options.push(et);
      }      
    }
    this.typeOptions = options;
  }

  showValue() {
    console.log('Changed to ', this.actionType);
  }
}
