import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AlertController } from "@ionic/angular";
import { format, getYear } from "date-fns";
import { actionsForType, JournalService } from "src/app/journal.service";
import { JournalEntry } from "./../../journal.service";

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
    private alertCtrl: AlertController
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
      header: "Delete entry?",
      message: "Do you really want to delete this entry?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          cssClass: "secondary",
        },
        {
          text: "Delete",
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

  datesDiffer(d1: Date, d2: Date) {
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
