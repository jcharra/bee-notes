import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { JournalEntry, JournalService } from 'src/app/journal.service';

@Component({
  selector: 'app-swarm-journal',
  templateUrl: './swarm-journal.page.html',
  styleUrls: ['./swarm-journal.page.scss'],
})
export class SwarmJournalPage implements OnInit {
  journalEntries: JournalEntry[];
  swarmId: string;

  constructor(
    private journalService: JournalService,
    private route: ActivatedRoute,
    private alertCtrl: AlertController,
    private translateService: TranslateService) { }

  ngOnInit() {
    this.swarmId = this.route.snapshot.params.swarmId;
  }

  ionViewDidEnter() {
    this.loadEntries();
  }

  loadEntries() {
    this.journalService
      .getEntries(this.swarmId)
      .subscribe((entries: JournalEntry[]) => {
        this.journalEntries = entries || [];
      });
  }

  async deleteEntry(entry: JournalEntry) {
    const alert = await this.alertCtrl.create({
      header: 'Eintrag löschen?',
      message: 'Soll der Eintrag wirklich gelöscht werden?',
      buttons: [
        {
          text: 'Abbrechen',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Löschen',
          cssClass: 'danger',
          handler: () => {
            this.journalService
              .deleteEntry(this.swarmId, entry.id)
              .subscribe(() => {
                this.loadEntries();
              });
          }
        }
      ]
    });

    await alert.present();
  }
}
