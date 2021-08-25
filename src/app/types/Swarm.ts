import { ColonyStatusInfo } from "./ColonyStatus";
import { JournalEntry } from "./JournalEntry";

export enum ActivityStatus {
  ACTIVE = "ACTIVE",
  DECEASED = "DECEASED",
  SOLD = "SOLD",
  DISSOLVED = "DISSOLVED",
}

export interface Swarm {
  id?: string;
  name: string;
  created: Date;
  statusInfo?: ColonyStatusInfo;
  lastAction?: JournalEntry;
  activityStatus?: ActivityStatus;
  ancestorId?: string; // id of ancestor
  isNucleus?: boolean;
  about?: string;
}
