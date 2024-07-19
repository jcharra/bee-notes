import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { IonSelect, NavController, PickerController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { JournalService } from "src/app/services/journal.service";
import { Countable, CountableForEntryType } from "src/app/types/Countable";
import { actionsForType, EntryType } from "src/app/types/EntryType";
import { JournalEntry } from "src/app/types/JournalEntry";

@Component({
  selector: "app-journal-edit-entry",
  templateUrl: "./journal-edit-entry.page.html",
  styleUrls: ["./journal-edit-entry.page.scss"],
})
export class JournalEditEntryPage implements OnInit, AfterViewInit {
  swarmId: string;
  entryId: string;
  type: string;
  typeOptions: EntryType[];
  actionType: EntryType;
  entryForm: UntypedFormGroup;
  saving = false;
  countable: Countable;
  initialDate: string;
  @ViewChild("actionSelect", { static: false }) selectRef: IonSelect;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private journalService: JournalService,
    private navCtrl: NavController,
    private pickerController: PickerController,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.swarmId = this.route.snapshot.params.swarmId;
    this.entryId = this.route.snapshot.queryParams.entryId;
    this.type = this.route.snapshot.queryParams.type;

    this.typeOptions = this.type ? actionsForType[this.type] : Object.values(EntryType);

    this.entryForm = this.formBuilder.group({
      actionType: new UntypedFormControl({ value: null, disabled: false }, Validators.required),
      date: [new Date(), Validators.required],
      amount: [0],
      text: [""],
    });
  }

  ionViewDidEnter() {
    if (this.entryId) {
      this.journalService.getEntry(this.swarmId, this.entryId).subscribe((entry: JournalEntry) => {
        this.entryForm.controls.actionType.setValue(entry.type ? entry.type.toString() : null);
        this.entryForm.controls.text.setValue(entry.text || "");
        this.entryForm.controls.amount.setValue(entry.amount || "");
        if (entry.date) {
          this.entryForm.controls.date.setValue(new Date(entry.date));
          this.initialDate = this.entryForm.controls.date.value.toISOString();
        } else {
          this.initialDate = new Date().toISOString();
        }
        this.onActionTypeChange();
      });
    } else {
      this.entryForm.controls.actionType.setValue(null);
      this.entryForm.controls.text.setValue("");
      this.entryForm.controls.amount.setValue("");
      this.entryForm.controls.date.setValue(new Date());
      this.initialDate = new Date().toISOString();
    }
  }

  save() {
    if (this.saving) {
      return;
    }

    this.saving = true;
    const entry: JournalEntry = {
      type: this.entryForm.get("actionType").value,
      date: this.entryForm.get("date").value,
      text: this.entryForm.get("text").value,
      amount: this.entryForm.get("amount").value,
    };

    if (this.entryId) {
      entry.id = this.entryId;
      this.journalService.updateEntry(this.swarmId, entry).subscribe(this.onSuccessfullySaved.bind(this));
    } else {
      this.journalService.createEntry(this.swarmId, entry).subscribe(this.onSuccessfullySaved.bind(this));
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

  async openAmountPicker() {
    const picker = await this.pickerController.create({
      columns: this.getAmountOptions(),
      buttons: [
        {
          text: this.translate.instant("GENERAL.cancel"),
          role: "cancel",
        },
        {
          text: this.translate.instant("GENERAL.ok"),
          handler: (value) => {
            this.entryForm.controls.amount.setValue(+value.amount.value || 0);
          },
        },
      ],
    });

    await picker.present();
  }

  setDate(dateStr: string | string[]) {
    this.entryForm.controls.date.setValue(new Date(typeof dateStr === "string" ? dateStr : dateStr[0]));
  }

  getAmountOptions() {
    const options = [];

    if (!this.countable) {
      return options;
    }

    for (let i = this.countable.lowerBound; i <= this.countable.upperBound; i += this.countable.stepWidth) {
      options.push({
        text: i + " " + this.translate.instant("UNIT." + (i === 1 ? this.countable.unitSingular : this.countable.unit)),
        value: i,
      });
    }

    return [{ name: "amount", options }];
  }

  onActionTypeChange() {
    const e = this.entryForm.controls.actionType.value as EntryType;
    this.countable = CountableForEntryType.get(e);
  }

  onCancel() {
    this.navCtrl.back();
  }
}
