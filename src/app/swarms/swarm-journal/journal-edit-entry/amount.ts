import { EntryType } from "./../../../journal.service";
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
    EntryType.WEIGHT_TRACKED,
    {
      lowerBound: 10.0,
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
      unit: "frames",
      unitSingular: "frame",
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
    EntryType.FRAMES_HONEY_REMOVED,
    {
      lowerBound: 1,
      upperBound: 20,
      stepWidth: 1,
      unit: "frames",
      unitSingular: "frame",
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
]);
