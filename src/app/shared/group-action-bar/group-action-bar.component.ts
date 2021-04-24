import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { AlertController } from "@ionic/angular";
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
    private reminderService: ReminderService,
    private journalService: JournalService,
    private alertCtrl: AlertController,
    private translate: TranslateService
  ) {}

  ngOnInit() {}

  addNewSwarm() {
    this.addSwarmEvent.emit(this.group.id);
  }

  setLocation() {
    this.groupService.setLocation(this.group.id);
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

  startDiagnosis() {}
}
