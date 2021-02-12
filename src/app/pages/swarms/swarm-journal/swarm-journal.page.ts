import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AlertController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { format, getYear } from "date-fns";
import { JournalService } from "src/app/services/journal.service";
import { actionsForType } from "src/app/types/EntryType";
import { JournalEntry } from "src/app/types/JournalEntry";

@Component({
  selector: "app-swarm-journal",
  templateUrl: "./swarm-journal.page.html",
  styleUrls: ["./swarm-journal.page.scss"],
})
export class SwarmJournalPage implements OnInit {
  journalEntries: JournalEntry[];
  filteredJournalEntries: JournalEntry[];
  swarmId: string;
  readonly: boolean;
  displayYear = getYear(new Date());
  maxYear = getYear(new Date());
  minYear = 2020;
  filter: string = null;

  constructor(
    private journalService: JournalService,
    private route: ActivatedRoute,
    private alertCtrl: AlertController,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.swarmId = this.route.snapshot.params.swarmId;
    this.readonly = this.route.snapshot.queryParams.readonly;
  }

  ionViewDidEnter() {
    this.loadEntries();
  }

  loadEntries() {
    const startOfYear = this.displayYear + "-01-01";
    const endOfYear = this.displayYear + "-12-31";
    this.journalService
      .getEntries(this.swarmId, { startAt: startOfYear, endAt: endOfYear })
      .subscribe((es: JournalEntry[]) => {
        this.journalEntries = es || [];
        this.updateFilteredEntries();
      });
  }

  updateFilteredEntries() {
    if (!this.filter) {
      this.filteredJournalEntries = this.journalEntries;
    } else {
      this.filteredJournalEntries = this.journalEntries.filter(
        (e) => actionsForType[this.filter].indexOf(e.type) > -1
      );
    }
  }

  async deleteEntry(entry: JournalEntry) {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant("JOURNAL_PAGE.deleteEntryHeading"),
      message: this.translate.instant("JOURNAL_PAGE.deleteEntryMsg"),
      buttons: [
        {
          text: this.translate.instant("GENERAL.cancel"),
          role: "cancel",
          cssClass: "secondary",
        },
        {
          text: this.translate.instant("JOURNAL_PAGE.deleteEntryConfirm"),
          cssClass: "danger",
          handler: () => {
            this.journalService
              .deleteEntry(this.swarmId, entry.id)
              .subscribe(() => {
                this.loadEntries();
              });
          },
        },
      ],
    });

    await alert.present();
  }

  datesDiffer(d1: Date | string, d2: Date | string) {
    return (
      format(new Date(d1), "yyyy-MM-dd") !== format(new Date(d2), "yyyy-MM-dd")
    );
  }

  changeYear(amount) {
    if (
      this.displayYear + amount <= this.maxYear &&
      this.displayYear + amount >= this.minYear
    ) {
      this.displayYear += amount;
      this.loadEntries();
    }
  }

  toggleFilter(tappedFilter: string) {
    if (this.filter === tappedFilter) {
      this.filter = null;
    } else {
      this.filter = tappedFilter;
    }
    this.updateFilteredEntries();
  }
}
