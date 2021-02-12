import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import {
  AlertController,
  NavController,
  ToastController,
} from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { addYears, format, getYear, startOfYear } from "date-fns";
import { first } from "rxjs/operators";
import { JournalService } from "src/app/journal.service";
import { EntryType } from "src/app/model/EntryType";
import { QueenService, QueenStatus } from "src/app/queen.service";

const DAY_OF_YEAR = "yyyy-MM-dd";

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
  minDate = format(startOfYear(addYears(new Date(), -1)), DAY_OF_YEAR);
  maxDate = format(new Date(), DAY_OF_YEAR);

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private queenService: QueenService,
    private journalService: JournalService,
    private toastController: ToastController,
    private translate: TranslateService,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.colonyId = this.route.snapshot.params.swarmId;
    this.queenService
      .getStatus(this.colonyId)
      .pipe(first())
      .subscribe((status: QueenStatus) => {
        this.currentStatus = status || {
          birthYear: null,
        };

        this.newStatus = {
          birthYear: this.currentStatus.birthYear,
          lastSeen: this.currentStatus.lastSeen
            ? format(new Date(this.currentStatus.lastSeen), DAY_OF_YEAR)
            : null,
          eggsSeen: this.currentStatus.eggsSeen
            ? format(new Date(this.currentStatus.eggsSeen), DAY_OF_YEAR)
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

  initQueenData() {
    this.newStatus.birthYear = getYear(new Date());
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
              date: new Date(this.newStatus.lastSeen),
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
              date: new Date(this.newStatus.eggsSeen),
              text: "",
              type: EntryType.QUEEN_EGGS_SPOTTED,
            })
            .subscribe();
        }

        this.navCtrl.back();
        this._showSavedToast();
      });
  }

  async queenDeceased() {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant("QUEEN.deceasedDialogTitle"),
      message: this.translate.instant("QUEEN.deceasedDialogBody"),
      buttons: [
        {
          text: this.translate.instant("GENERAL.cancel"),
          role: "cancel",
          cssClass: "secondary",
        },
        {
          text: this.translate.instant("QUEEN.deceasedDialogConfirm"),
          cssClass: "danger",
          handler: async () => {
            this.journalService
              .createEntry(this.colonyId, {
                date: new Date(),
                text: "",
                type: EntryType.QUEEN_DECEASED,
              })
              .subscribe();

            this.queenService.clearStatus(this.colonyId).subscribe(() => {
              this.newStatus = {
                birthYear: null,
              };
            });
          },
        },
      ],
    });

    await alert.present();
  }

  async _showSavedToast() {
    const toast = await this.toastController.create({
      message: this.translate.instant("QUEEN.onUpdateSuccess"),
      duration: 2000,
    });
    toast.present();
  }
}
