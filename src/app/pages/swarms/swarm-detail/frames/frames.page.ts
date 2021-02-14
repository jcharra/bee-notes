import { LocalizedString } from "@angular/compiler/src/output/output_ast";
import { Component, OnInit } from "@angular/core";
import { addYears, format, startOfYear } from "date-fns";
import { de } from "date-fns/locale";

enum AmountKey {
  HONEY = "FRAMES.honeyCombs",
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
  amounts: Map<string, number> = new Map();
  date = format(new Date(), DAY_OF_YEAR, { locale: de });
  minDate = format(startOfYear(addYears(new Date(), -1)), DAY_OF_YEAR);
  maxDate = format(new Date(), DAY_OF_YEAR);

  constructor() {}

  ngOnInit() {
    for (const k in AmountKey) {
      this.amounts.set(AmountKey[k], 0);
    }
  }

  changeAmount(key: string, num: number) {
    this.amounts.set(key, this.amounts.get(key) + num);
  }
}
