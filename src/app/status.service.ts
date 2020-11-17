import { Injectable } from '@angular/core';
import { differenceInDays } from 'date-fns';
import { EntryType, JournalEntry } from './journal.service';

export enum ColonyStatus {
  VARROA_MEDIUM = 'VARROA_MEDIUM',
  VARROA_CRITICAL = 'VARROA_CRITICAL',
  SWARMING = 'SWARMING'
}

export interface ColonyStatusInfo {
  colonyStatus: ColonyStatus;
  avgCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  getColonyStatus(entries: JournalEntry[]): ColonyStatusInfo {
    let varroaEnd;
    for (let entry of entries) {
      if (entry.type === EntryType.VARROA_CHECK_END) {
        varroaEnd = entry;
      } else if (entry.type === EntryType.VARROA_CHECK_START && varroaEnd) {
        let varroaAvg = varroaEnd.amount ?
          +varroaEnd.amount / (Math.ceil(differenceInDays(varroaEnd.date, entry.date) + 0.01)) :
          0;
        
        varroaAvg = Math.round(varroaAvg);
        
        if (varroaAvg >= 10) {
          return {
            colonyStatus: ColonyStatus.VARROA_CRITICAL,
            avgCount: varroaAvg
          }
        } else if (varroaAvg >= 5) {
          return {
            colonyStatus: ColonyStatus.VARROA_MEDIUM,
            avgCount: varroaAvg
          }
        }
      }
    }
  }

  constructor() { }
}
