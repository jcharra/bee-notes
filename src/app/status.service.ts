import { Injectable } from '@angular/core';
import { differenceInDays } from 'date-fns';
import { EntryType, JournalEntry } from './journal.service';

export enum ColonyStatus {
  VARROA_MEDIUM = 'VARROA_MEDIUM',
  VARROA_CRITICAL = 'VARROA_CRITICAL',
  VARROA_OK = 'VARROA_OK',
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
          +varroaEnd.amount / (differenceInDays(varroaEnd.date, entry.date) || 1) :
          0;
        
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
          avgCount: varroaAvg
        }
      }
    }
  }

  constructor() { }
}
