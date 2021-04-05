import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NavController, ToastController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { addYears, format, startOfYear } from "date-fns";
import { de } from "date-fns/locale";
import { forkJoin } from "rxjs";
import { JournalService } from "src/app/services/journal.service";
import { EntryType } from "src/app/types/EntryType";

enum AmountKey {
  DRONE = "FRAMES.droneCombs",
  FOOD = "FRAMES.foodCombs",
  EMPTY_COMBS = "FRAMES.emptyCombs",
  EMPTY_PANELS = "FRAMES.emptyPanels",
  BROOD = "FRAMES.broodCombs",
}

const DAY_OF_YEAR = "yyyy-MM-dd";

@Component({
  selector: "app-frames",
  templateUrl: "./frames.page.html",
  styleUrls: ["./frames.page.scss"],
})
export class FramesPage implements OnInit {
  colonyId: string;
  amounts: Map<string, number> = new Map();
  date = format(new Date(), DAY_OF_YEAR, { locale: de });
  minDate = format(startOfYear(addYears(new Date(), -1)), DAY_OF_YEAR);
  maxDate = format(new Date(), DAY_OF_YEAR);
  harvestAmount = 0;

  constructor(
    private journalService: JournalService,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private toastController: ToastController,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.colonyId = this.route.snapshot.params.swarmId;
    for (const k in AmountKey) {
      this.amounts.set(AmountKey[k], 0);
    }
  }

  changeAmount(key: string, num: number) {
    this.amounts.set(key, this.amounts.get(key) + num);
  }

  changeHarvest(num: number) {
    if (this.harvestAmount + num >= 0) {
      this.harvestAmount += num;
    }
  }

  save() {
    const observables = [];

    const broodChange = this.amounts.get(AmountKey.BROOD);
    if (broodChange) {
      const type =
        broodChange > 0
          ? EntryType.FRAMES_BROOD_INSERTED
          : EntryType.FRAMES_BROOD_REMOVED;
      const req = this.journalService.createEntry(this.colonyId, {
        date: new Date(this.date),
        type,
        amount: broodChange > 0 ? broodChange : -broodChange,
      });

      observables.push(req);
    }

    const emptyPanelsChange = this.amounts.get(AmountKey.EMPTY_PANELS);
    if (emptyPanelsChange) {
      const type =
        emptyPanelsChange > 0
          ? EntryType.FRAMES_EMPTY_PANEL_INSERTED
          : EntryType.FRAMES_EMPTY_PANEL_REMOVED;
      const req = this.journalService.createEntry(this.colonyId, {
        date: new Date(this.date),
        type,
        amount: emptyPanelsChange > 0 ? emptyPanelsChange : -emptyPanelsChange,
      });

      observables.push(req);
    }

    const emptyCombsChange = this.amounts.get(AmountKey.EMPTY_COMBS);
    if (emptyCombsChange) {
      const type =
        emptyCombsChange > 0
          ? EntryType.FRAMES_EMPTY_COMBS_INSERTED
          : EntryType.FRAMES_EMPTY_COMBS_REMOVED;
      const req = this.journalService.createEntry(this.colonyId, {
        date: new Date(this.date),
        type,
        amount: emptyCombsChange > 0 ? emptyCombsChange : -emptyCombsChange,
      });

      observables.push(req);
    }

    const foodChange = this.amounts.get(AmountKey.FOOD);
    if (foodChange) {
      const type =
        foodChange > 0
          ? EntryType.FRAMES_FOOD_INSERTED
          : EntryType.FRAMES_FOOD_INSERTED;
      const req = this.journalService.createEntry(this.colonyId, {
        date: new Date(this.date),
        type,
        amount: foodChange > 0 ? foodChange : -foodChange,
      });

      observables.push(req);
    }

    const droneChange = this.amounts.get(AmountKey.DRONE);
    if (droneChange) {
      const type =
        droneChange > 0
          ? EntryType.FRAMES_DRONE_INSERTED
          : EntryType.FRAMES_DRONE_REMOVED;
      const req = this.journalService.createEntry(this.colonyId, {
        date: new Date(this.date),
        type,
        amount: droneChange > 0 ? droneChange : -droneChange,
      });

      observables.push(req);
    }

    if (this.harvestAmount) {
      const type = EntryType.FRAMES_HONEY_HARVESTED;
      const req = this.journalService.createEntry(this.colonyId, {
        date: new Date(this.date),
        type,
        amount: this.harvestAmount,
      });

      observables.push(req);
    }

    forkJoin(observables).subscribe(() => {
      this.navCtrl.back();
      this.showSuccessToast();
    });
  }

  async showSuccessToast() {
    const toast = await this.toastController.create({
      message: this.translate.instant("FRAMES.onCreationSuccess"),
      duration: 2000,
    });
    toast.present();
  }
}
