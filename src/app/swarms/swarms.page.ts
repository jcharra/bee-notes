import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Swarm, SwarmService } from '../swarm.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-swarms',
  templateUrl: './swarms.page.html',
  styleUrls: ['./swarms.page.scss']
})
export class SwarmsPage implements OnInit {
  swarms$: Observable<Swarm[]>;

  constructor(
    private swarmService: SwarmService,
    private alertCtrl: AlertController
  ) {}

  ngOnInit(): void {
    this.swarms$ = this.swarmService.getSwarms();
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
              this.swarmService.createSwarm(value.name);
            }
          }
        }
      ]
    });

    await alert.present();
  }
}
