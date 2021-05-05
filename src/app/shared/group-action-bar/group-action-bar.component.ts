import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { AlertController, LoadingController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { forkJoin, Observable } from "rxjs";
import { UISwarmGroup } from "src/app/pages/swarms/swarms.page";
import { JournalService } from "src/app/services/journal.service";
import { ReminderService } from "src/app/services/reminder.service";
import { SwarmGroupService } from "src/app/services/swarm-group.service";
import { EntryType } from "src/app/types/EntryType";
import { Swarm } from "src/app/types/Swarm";

@Component({
  selector: "app-group-action-bar",
  templateUrl: "./group-action-bar.component.html",
  styleUrls: ["./group-action-bar.component.scss"],
})
export class GroupActionBarComponent implements OnInit {
  @Input() group: UISwarmGroup;
  @Output() addSwarmEvent = new EventEmitter<string>();
  @Output() changeEvent = new EventEmitter<string>();

  constructor(
    private groupService: SwarmGroupService,
    private journalService: JournalService,
    private alertCtrl: AlertController,
    private translate: TranslateService,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {}

  addNewSwarm() {
    this.addSwarmEvent.emit(this.group.id);
  }

  async setLocation() {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant("COLONIES_PAGE.setLocationDialogHeader"),
      message: this.translate.instant("COLONIES_PAGE.setLocationDialogMsg"),
      buttons: [
        {
          text: this.translate.instant("GENERAL.cancel"),
          role: "cancel",
        },
        {
          text: this.translate.instant("GENERAL.ok"),
          handler: async () => {
            const loading = await this.loadingCtrl.create({
              message: this.translate.instant("COLONIES_PAGE.localizing"),
              showBackdrop: true,
            });
            await loading.present();

            this.groupService
              .setLocation(this.group)
              .then(() => {
                loading.dismiss();
                this.changeEvent.emit();
              });
          },
        },
      ],
    });

    await alert.present();
  }

  async startTreatment() {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant(
        "COLONIES_PAGE.startTreatmentDialogHeader"
      ),
      message: this.translate.instant("COLONIES_PAGE.startTreatmentDialogMsg"),
      buttons: [
        {
          text: this.translate.instant("GENERAL.cancel"),
          role: "cancel",
        },
        {
          text: this.translate.instant("GENERAL.ok"),
          handler: () => {
            const entries: Observable<any>[] = [];
            this.group.swarms.forEach((s: Swarm) => {
              entries.push(
                this.journalService.createEntry(s.id, {
                  date: new Date(),
                  type: EntryType.VARROA_TREATMENT,
                })
              );
            });

            forkJoin(entries).subscribe(() => {
              this.changeEvent.emit();
            });
          },
        },
      ],
    });

    await alert.present();
  }

  async startDiagnosis() {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant(
        "COLONIES_PAGE.startDiagnosisDialogHeader"
      ),
      message: this.translate.instant("COLONIES_PAGE.startDiagnosisDialogMsg"),
      buttons: [
        {
          text: this.translate.instant("GENERAL.cancel"),
          role: "cancel",
        },
        {
          text: this.translate.instant("GENERAL.ok"),
          handler: () => {
            const entries: Observable<any>[] = [];
            this.group.swarms.forEach((s: Swarm) => {
              entries.push(
                this.journalService.createEntry(s.id, {
                  date: new Date(),
                  type: EntryType.VARROA_CHECK_START,
                })
              );
            });

            forkJoin(entries).subscribe(() => {
              this.changeEvent.emit();
            });
          },
        },
      ],
    });

    await alert.present();
  }
}
