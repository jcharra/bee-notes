import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { JournalEntry, JournalService } from 'src/app/journal.service';
import { EntryType } from './../../../journal.service';

@Component({
  selector: 'app-journal-edit-entry',
  templateUrl: './journal-edit-entry.page.html',
  styleUrls: ['./journal-edit-entry.page.scss'],
})
export class JournalEditEntryPage implements OnInit {
  swarmId: string;
  entryId: string;
  type: string;
  typeOptions: EntryType[];
  actionType: EntryType;
  entryForm: FormGroup;

  constructor(private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private journalService: JournalService) {
    
  }

  save() {
    console.log(this.entryForm.value);
    this.journalService
      .createEntry(this.swarmId, {
        type: this.entryForm.get('actionType').value,
        date: this.entryForm.get('date').value,
        text: this.entryForm.get('comment').value
      })
      .subscribe(() => console.log('Saved'));
  }

  ngOnInit() {
    this.swarmId = this.route.snapshot.params.swarmId;
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

    this.entryForm = this.formBuilder.group({
      actionType: [null, Validators.required],
      date: [null, Validators.required],
      text: ['null']
    });

    if (this.entryId) {
      this.journalService
        .getEntry(this.swarmId, this.entryId)
        .subscribe((entry: JournalEntry) => { 
          this.entryForm.controls.actionType.setValue(entry.type ? entry.type.toString() : null);
          this.entryForm.controls.date.setValue(entry.date);
          this.entryForm.controls.text.setValue(entry.text);
        });
    }
  }
}
