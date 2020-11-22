import { ColonyStatus, ColonyStatusInfo } from './../status.service';
import { Component } from '@angular/core';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { first, tap } from 'rxjs/operators';
import { JournalEntry, JournalService } from '../journal.service';
import { StatusService } from '../status.service';
import { Swarm, SwarmService } from '../swarm.service';


@Component({
  selector: 'app-swarms',
  templateUrl: './swarms.page.html',
  styleUrls: ['./swarms.page.scss']
})
export class SwarmsPage {
  swarms: Swarm[];
  userId: string;

  constructor(
    private swarmService: SwarmService,
    private journalService: JournalService,
    private alertCtrl: AlertController,
    private loadingController: LoadingController,
    private navController: NavController,
    private alertController: AlertController,
    private statusService: StatusService
  ) { }

  async loadSwarms() {
    const showSpinner = !this.swarms;
    const loading = await this.loadingController.create({
      message: 'Loading colonies ...',
      showBackdrop: true
    });

    if (showSpinner) {
      await loading.present();
    }

    this.swarmService
      .getSwarms()
      .pipe(
        first(),
        tap((s: Swarm[]) => {
          // only reassign if length has changed (avoids flickering)
          this.swarms = this.swarms && this.swarms.length === s.length ? this.swarms : s;

          this.swarms.forEach((sw: Swarm) => {
            this.journalService
              .getEntries(sw.id, 6)
              .subscribe((e: JournalEntry[]) => {
                if (e && e.length > 0) {
                  sw.lastAction = e[0];
                  sw.statusInfo = this.statusService.getColonyStatus(e);
                }
              });
          });

          showSpinner && loading.dismiss();
        })
      )
      .subscribe();
  }

  migrate() {
    // put migrations here

  }

  ionViewDidEnter() {
    this.loadSwarms();
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
                .subscribe(() => {
                  this.loadSwarms();
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
