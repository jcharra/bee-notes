import { Injectable } from "@angular/core";
import { differenceInHours } from "date-fns";
import { ColonyStatus, ColonyStatusInfo } from "../types/ColonyStatus";
import { EntryType } from "../types/EntryType";
import { JournalEntry } from "../types/JournalEntry";

@Injectable({
  providedIn: "root",
})
export class StatusService {
  getColonyStatus(entries: JournalEntry[]): ColonyStatusInfo {
    let varroaEnd;
    for (let entry of entries) {
      if (entry.type === EntryType.VARROA_CHECK_END) {
        varroaEnd = entry;
      } else if (entry.type === EntryType.VARROA_CHECK_START && varroaEnd) {
        let varroaAvg = varroaEnd.amount
          ? +varroaEnd.amount /
            ((differenceInHours(varroaEnd.date, new Date(entry.date)) || 1) /
              24)
          : 0;

        varroaAvg = Math.round(varroaAvg);

        let status: ColonyStatus;
        if (varroaAvg >= 10) {
          status = ColonyStatus.VARROA_CRITICAL;
        } else if (varroaAvg >= 5) {
          status = ColonyStatus.VARROA_MEDIUM;
        } else {
          status = ColonyStatus.VARROA_OK;
        }

        return {
          colonyStatus: status,
          avgCount: varroaAvg,
        };
      }
    }
  }

  constructor() {}
}
