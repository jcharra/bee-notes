import { EntryType } from "src/app/types/EntryType";

export interface Countable {
  unit: string;
  unitSingular: string;
  lowerBound: number;
  upperBound: number;
  stepWidth: number;
}

export const CountableForEntryType: Map<EntryType, Countable> = new Map([
  [
    EntryType.VARROA_CHECK_END,
    {
      lowerBound: 1,
      upperBound: 200,
      stepWidth: 1,
      unit: "mites",
      unitSingular: "mite",
    },
  ],
  [
    EntryType.FOOD_ADDED,
    {
      lowerBound: 0.5,
      upperBound: 20,
      stepWidth: 0.5,
      unit: "kg",
      unitSingular: "kg",
    },
  ],
  [
    EntryType.WEIGHT_MEASURED,
    {
      lowerBound: 5.0,
      upperBound: 80,
      stepWidth: 1,
      unit: "kg",
      unitSingular: "kg",
    },
  ],
  [
    EntryType.FRAMES_BROOD_COUNTED,
    {
      lowerBound: 0.5,
      upperBound: 20,
      stepWidth: 0.5,
      unit: "combs",
      unitSingular: "comb",
    },
  ],
  [
    EntryType.FRAMES_EMPTY_PANEL_INSERTED,
    {
      lowerBound: 1,
      upperBound: 20,
      stepWidth: 1,
      unit: "panels",
      unitSingular: "panel",
    },
  ],
  [
    EntryType.FRAMES_EMPTY_PANEL_REMOVED,
    {
      lowerBound: 1,
      upperBound: 20,
      stepWidth: 1,
      unit: "panels",
      unitSingular: "panel",
    },
  ],
  [
    EntryType.FRAMES_HONEY_HARVESTED,
    {
      lowerBound: 1,
      upperBound: 20,
      stepWidth: 1,
      unit: "kg",
      unitSingular: "kg",
    },
  ],
  [
    EntryType.FRAMES_DRONE_INSERTED,
    {
      lowerBound: 1,
      upperBound: 20,
      stepWidth: 1,
      unit: "frames",
      unitSingular: "frame",
    },
  ],
  [
    EntryType.FRAMES_DRONE_REMOVED,
    {
      lowerBound: 1,
      upperBound: 20,
      stepWidth: 1,
      unit: "frames",
      unitSingular: "frame",
    },
  ],
  [
    EntryType.FRAMES_EMPTY_COMBS_INSERTED,
    {
      lowerBound: 1,
      upperBound: 20,
      stepWidth: 1,
      unit: "combs",
      unitSingular: "comb",
    },
  ],
  [
    EntryType.FRAMES_EMPTY_COMBS_REMOVED,
    {
      lowerBound: 1,
      upperBound: 20,
      stepWidth: 1,
      unit: "combs",
      unitSingular: "comb",
    },
  ],
  [
    EntryType.FRAMES_BROOD_INSERTED,
    {
      lowerBound: 1,
      upperBound: 20,
      stepWidth: 1,
      unit: "combs",
      unitSingular: "comb",
    },
  ],
  [
    EntryType.FRAMES_BROOD_REMOVED,
    {
      lowerBound: 1,
      upperBound: 20,
      stepWidth: 1,
      unit: "combs",
      unitSingular: "comb",
    },
  ],
  [
    EntryType.FRAMES_FOOD_INSERTED,
    {
      lowerBound: 1,
      upperBound: 20,
      stepWidth: 1,
      unit: "combs",
      unitSingular: "comb",
    },
  ],
  [
    EntryType.FRAMES_FOOD_REMOVED,
    {
      lowerBound: 1,
      upperBound: 20,
      stepWidth: 1,
      unit: "combs",
      unitSingular: "comb",
    },
  ],
  [
    EntryType.FRAMES_STOREYS_ADDED,
    {
      lowerBound: 1,
      upperBound: 3,
      stepWidth: 1,
      unit: "storeys",
      unitSingular: "storey",
    },
  ],
  [
    EntryType.FRAMES_STOREYS_REMOVED,
    {
      lowerBound: 1,
      upperBound: 3,
      stepWidth: 1,
      unit: "storeys",
      unitSingular: "storey",
    },
  ],
  [
    EntryType.GOT_STUNG,
    {
      lowerBound: 1,
      upperBound: 20,
      stepWidth: 1,
      unit: "stings",
      unitSingular: "sting",
    },
  ],
  [
    EntryType.QUEEN_CELL_SPOTTED,
    {
      lowerBound: 1,
      upperBound: 10,
      stepWidth: 1,
      unit: "cells",
      unitSingular: "cell",
    },
  ],
  [
    EntryType.QUEEN_CELL_REMOVED,
    {
      lowerBound: 1,
      upperBound: 10,
      stepWidth: 1,
      unit: "cells",
      unitSingular: "cell",
    },
  ],
]);
