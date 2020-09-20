import { JournalService, JournalEntry } from 'src/app/journal.service';
import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { Swarm, SwarmService } from '../swarm.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-swarms',
  templateUrl: './swarms.page.html',
  styleUrls: ['./swarms.page.scss']
})
export class SwarmsPage implements OnInit {
  swarms: Swarm[];
  userId: string;
  lastAction: Map<string, JournalEntry> = new Map();

  constructor(
    private swarmService: SwarmService,
    private journalService: JournalService,
    private alertCtrl: AlertController,
    public loadingController: LoadingController
  ) { }

  async loadSwarms() {
    const loading = await this.loadingController.create({
      message: 'Loading swarms...',
      showBackdrop: true
    });
    await loading.present();

    this.swarms = [];

    this.swarmService
      .getSwarms()
      .pipe(map((s: Swarm[]) => {
        this.swarms = s;

        this.swarms
          .forEach(sw => {
            this.journalService
              .getEntries(sw.id, 1)
              .subscribe((e: JournalEntry[]) => {
                if (e && e.length > 0) {
                  this.lastAction.set(sw.id, e[0]);
                } 
              });
          });
        
        loading.dismiss();
      }))
      .subscribe();
  }

  ngOnInit(): void {
    this.loadSwarms();
  }

  async createSwarm() {
    const alert = await this.alertCtrl.create({
      header: 'Neues Volk',
      message: 'Wie soll das Volk heißen?',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Wähle einen Namen'
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
            if (value.name.trim()) {

              let newSwarm: Swarm = {
                name: value.name.trim(),
                created: new Date()
              };

              this.swarmService
                .createSwarm(newSwarm)
                .subscribe((result: { name: string }) => {
                  newSwarm.id = result.name;
                  this.swarms.push(newSwarm);
                });
            }
          }
        }
      ]
    });

    await alert.present();
  }
}
