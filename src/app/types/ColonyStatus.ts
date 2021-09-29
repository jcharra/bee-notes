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

export enum VarroaStatus {
  OK = "OK",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  NEEDS_CHECK = "NEEDS_CHECK",
  UNKNOWN = "UNKNOWN",
}

export enum QueenHealth {
  EXCELLENT = "EXCELLENT",
  GOOD = "GOOD",
  MEDIUM = "MEDIUM",
  POOR = "POOR",
  PROBABLY_DEAD = "PROBABLY_DEAD",
  DEAD = "DEAD",
  NEEDS_CHECK = "NEEDS_CHECK",
  UNKNOWN = "UNKNOWN",
}

export enum ColonyAggression {
  FRIENDLY = "FRIENDLY",
  SLIGHTLY_AGGRESSIVE = "SLIGHTLY_AGGRESSIVE",
  AGGRESSIVE = "AGGRESSIVE",
  SUPER_AGGRESSIVE = "SUPER_AGGRESSIVE",
  UNKNOWN = "UNKNOWN",
}
