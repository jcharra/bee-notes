import { EntryType } from './../../../journal.service';
export interface Countable {
  unit: string,
  unitSingular: string,
  lowerBound: number,
  upperBound: number,
  stepWidth: number
}

export const CountableForEntryType: Map<EntryType, Countable> = new Map([
  [EntryType.VARROA_CHECK_END,
    {
      lowerBound: 1,
      upperBound: 200,
      stepWidth: 1,
      unit: 'mites',
      unitSingular: 'mite'
    }
  ], [EntryType.FOOD_ADDED,
    {
      lowerBound: 0.5,
      upperBound: 20,
      stepWidth: 0.5,
      unit: 'kg',
      unitSingular: 'kg'
    }
  ], [EntryType.BROOD_COUNT,
    {
      lowerBound: 0.5,
      upperBound: 20,
      stepWidth: 0.5,
      unit: 'frames',
      unitSingular: 'frame'
    }
  ], [EntryType.CENTER_PANELS_ADDED,
    {
      lowerBound: 1,
      upperBound: 20,
      stepWidth: 1,
      unit: 'panels',
      unitSingular: 'panel'
    }
  ], [EntryType.HARVEST,
    {
      lowerBound: 1,
      upperBound: 20,
      stepWidth: 1,
      unit: 'frames',
      unitSingular: 'frame'
    }
  ]
]);