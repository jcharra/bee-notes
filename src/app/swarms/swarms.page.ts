import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { map } from 'rxjs/operators';
import { JournalEntry, JournalService } from '../journal.service';
import { ColonyStatus, StatusService } from '../status.service';
import { Swarm, SwarmService } from '../swarm.service';


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
    private loadingController: LoadingController,
    private navController: NavController,
    private alertController: AlertController,
    private statusService: StatusService
  ) { }

  async loadSwarms(withSpinner: boolean = true) {
    const loading = await this.loadingController.create({
      message: 'Loading swarms...',
      showBackdrop: true
    });

    if (withSpinner) {
      await loading.present();
    }

    this.swarmService
      .getSwarms()
      .pipe(map((s: Swarm[]) => {
        this.swarms = s || [];

        this.swarms
          .forEach((sw: Swarm) => {
            this.journalService
              .getEntries(sw.id, 6)
              .subscribe((e: JournalEntry[]) => {
                if (e && e.length > 0) {
                  this.lastAction.set(sw.id, e[0]);
                  sw.status = this.statusService.getColonyStatus(e);
                }
              });
          });

        withSpinner && loading.dismiss();
      }))
      .subscribe();
  }

  ngOnInit(): void {
    
  }

  migrateJournal() {
    // put migrations here
    console.log('no migration');
  }

  ionViewDidEnter() {
    this.loadSwarms(!this.swarms || this.swarms.length === 0);
  }

  openSwarmDetail(swarmId: string) {
    this.navController.navigateForward('/swarms/view/' + swarmId);
  }

  async createSwarm() {
    const alert = await this.alertCtrl.create({
      header: 'New colony',
      message: 'Give your colony a name',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Choose name'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Add colony',
          handler: value => {
            const name = value.name.trim();
            if (name) {

              let newSwarm: Swarm = {
                name: value.name.trim(),
                created: new Date()
              };

              this.swarmService
                .createSwarm(newSwarm)
                .subscribe((result: { name: string }) => {
                  newSwarm.id = result.name;
                  this.swarms.push(newSwarm);
                }, err => {
                    this.onCreationFailure(err);
                });
            } else {
              this.onCreationFailure('Please choose a valid name');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async onCreationFailure(msg: string) {
    const alert = await this.alertController.create({
      header: 'Creation failed',
      message: msg,
      buttons: ['OK']
    });

    await alert.present();
  }
}
