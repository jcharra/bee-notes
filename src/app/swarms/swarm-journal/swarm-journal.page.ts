import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AlertController } from "@ionic/angular";
import { format } from "date-fns";
import { JournalService } from "src/app/journal.service";
import { JournalEntry } from "./../../journal.service";

@Component({
  selector: "app-swarm-journal",
  templateUrl: "./swarm-journal.page.html",
  styleUrls: ["./swarm-journal.page.scss"],
})
export class SwarmJournalPage implements OnInit {
  journalEntries: JournalEntry[];
  swarmId: string;
  readonly: boolean;

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
    this.journalService
      .getEntries(this.swarmId)
      .subscribe((es: JournalEntry[]) => {
        this.journalEntries = es || [];
      });
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
}
