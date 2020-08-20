import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Swarm, SwarmService } from '../../swarm.service';
import { JournalEntry, JournalService } from '../../journal.service';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-swarm-detail',
  templateUrl: './swarm-detail.page.html',
  styleUrls: ['./swarm-detail.page.scss']
})
export class SwarmDetailPage implements OnInit {
  swarm: Swarm;
  journalEntries: JournalEntry[];

  constructor(
    private swarmService: SwarmService,
    private journalService: JournalService,
    private route: ActivatedRoute,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params.id;
    this.swarmService
      .getSwarm(id)
      .subscribe((s: Swarm) => { 
        this.swarm = s;
      });
    
    this.journalService
      .getEntries(id)
      .subscribe((entries: JournalEntry[]) => { 
        this.journalEntries = entries;
      });
  }

  async createEntry() {
    const alert = await this.alertCtrl.create({
      header: 'Neuer Eintrag',
      message: 'Was hast Du heute für dieses Volk gemacht?',
      inputs: [
        {
          name: 'title',
          type: 'text',
          placeholder: 'Kurzfassung'
        }, {
          name: 'text',
          type: 'text',
          placeholder: 'Beschreibung'
        }
      ],
      buttons: [
        {
          text: 'Abbrechen',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Anlegen',
          handler: value => {
            if (value.title.trim()) {

              let newEntry: JournalEntry = {
                swarmId: this.swarm.id,
                title: value.title.trim(),
                text: value.text.trim(),
                date: new Date()
              };

              this.journalService
                .saveEntry(newEntry)
                .subscribe((result: { name: string }) => { 
                  newEntry.id = result.name;
                  this.journalEntries.push(newEntry);
                });
            }
          }
        }
      ]
    });

    await alert.present();
  }
}
