import { Injectable } from "@angular/core";
import { Swarm } from "../types/Swarm";
import { RateApp } from "capacitor-rate-app";
import { differenceInMonths } from "date-fns";
import { Platform } from "@ionic/angular";

const validDate = (d) => d && d.getTime && !isNaN(d.getTime());

@Injectable({
  providedIn: "root",
})
export class AppreviewService {
  constructor(private plt: Platform) {}

  checkReview(swarms: Swarm[]) {
    if (!this.plt.is("ios")) {
      return;
    }

    if (!swarms || swarms.length === 0) {
      return;
    }

    let createdDates = swarms.map((s) => s.created).filter(validDate);

    if (createdDates.length === 0) {
      return;
    }

    createdDates.sort();

    const oldest = createdDates[0];

    const monthsAgo = differenceInMonths(new Date(), oldest);

    // If the oldest colony was created 1, 4, 7, 10, ... months ago,
    // ask for a nice review.
    if (monthsAgo % 3 === 1) {
      RateApp.requestReview();
    }
  }
}
