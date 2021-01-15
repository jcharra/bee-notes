import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NavController } from "@ionic/angular";
import { addYears, format, getYear } from "date-fns";
import { first } from "rxjs/operators";
import { EntryType, JournalService } from "src/app/journal.service";
import { QueenService, QueenStatus } from "src/app/queen.service";

@Component({
  selector: "app-queen-status",
  templateUrl: "./queen-status.page.html",
  styleUrls: ["./queen-status.page.scss"],
})
export class QueenStatusPage implements OnInit {
  currentStatus: QueenStatus;
  newStatus: QueenStatus;
  colonyId: string;
  maxYear = getYear(new Date());
  minYear = getYear(addYears(new Date(), -4));

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private queenService: QueenService,
    private journalService: JournalService
  ) {}

  ngOnInit() {
    this.colonyId = this.route.snapshot.params.swarmId;
    this.queenService
      .getStatus(this.colonyId)
      .pipe(first())
      .subscribe((status: QueenStatus) => {
        this.currentStatus = status || {
          birthYear: getYear(new Date()),
        };

        this.newStatus = {
          birthYear: this.currentStatus.birthYear,
          lastSeen: this.currentStatus.lastSeen
            ? format(new Date(this.currentStatus.lastSeen), "yyyy-MM-dd")
            : null,
          eggsSeen: this.currentStatus.eggsSeen
            ? format(new Date(this.currentStatus.eggsSeen), "yyyy-MM-dd")
            : null,
        };
      });
  }

  incrementBirthYear() {
    if (this.newStatus.birthYear < this.maxYear) {
      this.newStatus.birthYear += 1;
    }
  }

  decrementBirthYear() {
    if (this.newStatus.birthYear > this.minYear) {
      this.newStatus.birthYear -= 1;
    }
  }

  save() {
    this.queenService
      .saveStatus(this.colonyId, {
        birthYear: this.newStatus.birthYear,
        lastSeen:
          (this.newStatus.lastSeen && new Date(this.newStatus.lastSeen)) ||
          null,
        eggsSeen:
          (this.newStatus.eggsSeen && new Date(this.newStatus.eggsSeen)) ||
          null,
      })
      .subscribe(() => {
        if (
          this.newStatus.lastSeen &&
          new Date(this.newStatus.lastSeen) !== this.currentStatus.lastSeen
        ) {
          this.journalService
            .createEntry(this.colonyId, {
              date: new Date(this.newStatus.lastSeen).toISOString(),
              text: "",
              type: EntryType.QUEEN_SPOTTED,
            })
            .subscribe();
        }

        if (
          this.newStatus.eggsSeen &&
          new Date(this.newStatus.eggsSeen) !== this.currentStatus.eggsSeen
        ) {
          this.journalService
            .createEntry(this.colonyId, {
              date: new Date(this.newStatus.eggsSeen).toISOString(),
              text: "",
              type: EntryType.EGGS_SPOTTED,
            })
            .subscribe();
        }

        this.navCtrl.back();
      });
  }
}
