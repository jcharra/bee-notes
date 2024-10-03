import { Injectable } from "@angular/core";
import { Swarm } from "../types/Swarm";
import { InAppReview } from "@capacitor-community/in-app-review";
import { differenceInMonths } from "date-fns";
import { Platform } from "@ionic/angular";
import { Preferences } from "@capacitor/preferences";

const validDate = (d) => d && d.getTime && !isNaN(d.getTime());
const storageLastReviewRequestDate = "LAST_REVIEW_REQUEST";
@Injectable({
  providedIn: "root",
})
export class AppreviewService {
  constructor(private plt: Platform) {}

  async checkReview(swarms: Swarm[]) {
    if (!this.plt.is("ios")) {
      return;
    }

    if (!swarms || swarms.length === 0) {
      return;
    }

    const lastDate = await Preferences.get({ key: storageLastReviewRequestDate });
    if (lastDate && lastDate.value) {
      if (differenceInMonths(new Date(), new Date(lastDate.value)) > 3) {
        this.requestReview();
      }
    } else {
      // The user has never been asked for a review => determine how long ago
      // the creation of the first colony has been
      let createdDates = swarms.map((s) => s.created).filter(validDate);

      if (createdDates.length === 0) {
        return;
      }

      createdDates.sort();

      const oldest = createdDates[0];

      const monthsAgo = differenceInMonths(new Date(), oldest);

      if (monthsAgo > 2) {
        this.requestReview();
      }
    }
  }

  private async requestReview() {
    await Preferences.set({
      key: storageLastReviewRequestDate,
      value: new Date().toISOString(),
    });
    InAppReview.requestReview();
  }
}
