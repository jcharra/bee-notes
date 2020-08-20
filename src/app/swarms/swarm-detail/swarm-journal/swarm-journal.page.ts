import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { format, parse } from 'date-fns';
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
    private alertCtrl: AlertController) { }

  ngOnInit() {
    this.swarmId = this.route.snapshot.params.id;
    this.loadEntries();
  }

  loadEntries() {
    this.journalService
      .getEntries(this.swarmId)
      .subscribe((entries: JournalEntry[]) => { 
        this.journalEntries = entries;
      });
  }

  async editEntry(entry: JournalEntry = null) {
    const alert = await this.alertCtrl.create({
      header: entry ? 'Eintrag bearbeiten' : 'Neuer Eintrag',
      message: entry ? '' : 'Was hast Du für dieses Volk gemacht?',
      inputs: [
        {
          name: 'title',
          type: 'text',
          placeholder: 'Kurzfassung',
          value: entry?.title
        }, {
          name: 'text',
          type: 'text',
          placeholder: 'Beschreibung',
          value: entry?.text
        }, {
          name: 'date',
          type: 'date',
          value: format(entry?.date || new Date(), 'yyyy-MM-dd'),
        }
      ],
      buttons: [
        {
          text: 'Abbrechen',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: entry ? 'Aktualisieren' : 'Anlegen',
          handler: value => {
            if (value.title.trim()) {

              let _entry: JournalEntry = {
                swarmId: this.swarmId,
                title: value.title.trim(),
                text: value.text.trim(),
                date: parse(value.date, 'yyyy-MM-dd', new Date())
              };

              if (!entry) {
                this.journalService
                  .createEntry(_entry)
                  .subscribe((result: { name: string }) => { 
                    _entry.id = result.name;
                    this.journalEntries.push(_entry);
                  });
              } else {
                _entry.id = entry.id;
                this.journalService
                  .updateEntry(_entry)
                  .subscribe(() => { 
                    this.loadEntries();
                  });
              }              
            }
          }
        }
      ]
    });

    await alert.present();
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
              .deleteEntry(entry.id)
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
