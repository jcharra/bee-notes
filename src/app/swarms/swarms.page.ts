import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Swarm, SwarmService } from '../swarm.service';

@Component({
  selector: 'app-swarms',
  templateUrl: './swarms.page.html',
  styleUrls: ['./swarms.page.scss']
})
export class SwarmsPage implements OnInit {
  swarms: Swarm[];
  userId: string;

  constructor(
    private swarmService: SwarmService,
    private alertCtrl: AlertController
  ) { }

  ngOnInit(): void {
    this.swarmService
      .getSwarms()
      .subscribe((s: Swarm[]) => {
        this.swarms = s;
      });
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
