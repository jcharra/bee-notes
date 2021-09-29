import { Component, Input, OnInit } from "@angular/core";
import { differenceInHours } from "date-fns";
import { first, tap } from "rxjs/operators";
import { JournalService } from "src/app/services/journal.service";
import { ColonyAggression, QueenHealth, VarroaStatus } from "src/app/types/ColonyStatus";
import { EntryType } from "src/app/types/EntryType";
import { JournalEntry } from "src/app/types/JournalEntry";

interface VarroaInfo {
  status: VarroaStatus;
  average: number;
}

@Component({
  selector: "status-indicator",
  templateUrl: "./status-indicator.component.html",
  styleUrls: ["./status-indicator.component.scss"],
})
export class StatusIndicatorComponent implements OnInit {
  @Input() colonyId: string;
  @Input() isNucleus: boolean;
  varroaInfo: VarroaInfo;
  queenHealth: QueenHealth;
  aggression: ColonyAggression;
  loading: boolean;

  constructor(private journalService: JournalService) {}

  ngOnInit() {
    this.loading = true;
    this.journalService
      .getDigest(this.colonyId)
      .pipe(
        first(),
        tap((entries: JournalEntry[]) => {
          this.varroaInfo = this._determineVarroaInfo(entries);
          this.queenHealth = this._determineQueenHealth(entries);
          this.aggression = this._determineAggression(entries);
        })
      )
      .subscribe();
  }

  private _determineVarroaInfo(entries: JournalEntry[]): VarroaInfo {
    let varroaEnd;
    for (let entry of entries) {
      if (entry.type === EntryType.VARROA_CHECK_END) {
        varroaEnd = entry;
      } else if (entry.type === EntryType.VARROA_CHECK_START && varroaEnd) {
        let varroaAvg = varroaEnd.amount
          ? +varroaEnd.amount / ((differenceInHours(varroaEnd.date, new Date(entry.date)) || 1) / 24)
          : 0;
        return {
          average: Math.round(varroaAvg),
          status: this._getVarroaStatusForTimeOfYear(varroaAvg),
        };
      }
    }
    return { average: 0, status: VarroaStatus.OK };
  }

  private _determineQueenHealth(entries: JournalEntry[]): QueenHealth {
    return QueenHealth.EXCELLENT;
  }

  private _determineAggression(entries: JournalEntry[]): ColonyAggression {
    return ColonyAggression.SUPER_AGGRESSIVE;
  }

  private _getVarroaStatusForTimeOfYear(avg: number) {
    if (avg > 10) {
      return VarroaStatus.HIGH;
    } else if (avg > 5) {
      return VarroaStatus.MEDIUM;
    } else {
      return VarroaStatus.OK;
    }
  }
}
