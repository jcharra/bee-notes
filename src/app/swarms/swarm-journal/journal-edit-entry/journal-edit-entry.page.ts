import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IonSelect, NavController } from '@ionic/angular';
import { JournalEntry, JournalService } from 'src/app/journal.service';
import { EntryType } from './../../../journal.service';

@Component({
  selector: 'app-journal-edit-entry',
  templateUrl: './journal-edit-entry.page.html',
  styleUrls: ['./journal-edit-entry.page.scss'],
})
export class JournalEditEntryPage implements OnInit, AfterViewInit {
  swarmId: string;
  entryId: string;
  type: string;
  typeOptions: EntryType[];
  actionType: EntryType;
  entryForm: FormGroup;
  @ViewChild('actionSelect', { static: false }) selectRef: IonSelect;

  constructor(private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private journalService: JournalService,
    private navCtrl: NavController) {

  }

  save() {
    const entry: JournalEntry = {
      type: this.entryForm.get('actionType').value,
      date: this.entryForm.get('date').value,
      text: this.entryForm.get('text').value
    };

    if (this.entryId) {
      entry.id = this.entryId;
      this.journalService
        .updateEntry(this.swarmId, entry)
        .subscribe(this.onSuccessfullySaved.bind(this));
    } else {
      this.journalService
        .createEntry(this.swarmId, entry)
        .subscribe(this.onSuccessfullySaved.bind(this));
    }
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
      date: [new Date().toISOString(), Validators.required],
      text: ['']
    });

    if (this.entryId) {
      this.journalService
        .getEntry(this.swarmId, this.entryId)
        .subscribe((entry: JournalEntry) => {
          this.entryForm.controls.actionType.setValue(entry.type ? entry.type.toString() : null);
          this.entryForm.controls.text.setValue(entry.text || '');
          if (entry.date) {
            this.entryForm.controls.date.setValue(new Date(entry.date).toISOString());
          }
        });
    }
  }

  onSuccessfullySaved() {
    this.navCtrl.back();
  }

  ngAfterViewInit() {
    if (this.selectRef && !this.entryId) {
      this.selectRef.open();
    }
  }
}
