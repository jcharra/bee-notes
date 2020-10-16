import { Injectable } from '@angular/core';
import { differenceInDays } from 'date-fns';
import { EntryType, JournalEntry } from './journal.service';

export enum ColonyStatus {
  VARROA_MEDIUM = 'VARROA_MEDIUM',
  VARROA_CRITICAL = 'VARROA_CRITICAL',
  SWARMING = 'SWARMING'
}

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  getColonyStatus(entries: JournalEntry[]): ColonyStatus {
    let varroaEnd;
    for (let entry of entries) {
      if (entry.type === EntryType.VARROA_CHECK_END) {
        varroaEnd = entry;
      } else if (entry.type === EntryType.VARROA_CHECK_START && varroaEnd) {
        const varroaAvg = varroaEnd.amount ?
          +varroaEnd.amount / differenceInDays(varroaEnd.date, entry.date) :
          0;
        
        if (varroaAvg > 20) {
          return ColonyStatus.VARROA_CRITICAL
        } else if (varroaAvg > 10) {
          return ColonyStatus.VARROA_MEDIUM;
        }
      }
    }
  }

  constructor() { }
}
