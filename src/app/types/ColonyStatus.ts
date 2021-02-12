export enum ColonyStatus {
  VARROA_MEDIUM = "VARROA_MEDIUM",
  VARROA_CRITICAL = "VARROA_CRITICAL",
  VARROA_OK = "VARROA_OK",
  SWARMING = "SWARMING",
}

export interface ColonyStatusInfo {
  colonyStatus: ColonyStatus;
  avgCount: number;
}
