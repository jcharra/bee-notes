import { TestBed } from "@angular/core/testing";
import { ColonyStatus } from "../types/ColonyStatus";
import { EntryType } from "../types/EntryType";

import { StatusService } from "./status.service";

describe("StatusService", () => {
  let service: StatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StatusService);
  });

  it("should not have a division by zero for 0 days", () => {
    const entries = [
      {
        type: EntryType.VARROA_CHECK_END,
        text: "",
        amount: 10,
        date: new Date(2020, 10, 1),
      },
      {
        type: EntryType.VARROA_CHECK_START,
        text: "",
        date: new Date(2020, 10, 1),
      },
    ];

    const status = service.getColonyStatus(entries);

    expect(status.colonyStatus).toEqual(ColonyStatus.VARROA_CRITICAL);
    expect(status.avgCount).toEqual(240);
  });

  it("should divide by float number of days", () => {
    const entries = [
      {
        type: EntryType.VARROA_CHECK_END,
        text: "",
        amount: 32,
        date: new Date(2020, 10, 5, 9, 0),
      },
      {
        type: EntryType.VARROA_CHECK_START,
        text: "",
        date: new Date(2020, 10, 2, 18, 0),
      },
    ];

    const status = service.getColonyStatus(entries);

    expect(status.colonyStatus).toEqual(ColonyStatus.VARROA_CRITICAL);
    expect(status.avgCount).toEqual(12);
  });

  it("should round to nearest integer", () => {
    const entries = [
      {
        type: EntryType.VARROA_CHECK_END,
        text: "",
        amount: 20,
        date: new Date(2020, 10, 7),
      },
      {
        type: EntryType.VARROA_CHECK_START,
        text: "",
        date: new Date(2020, 10, 1),
      },
    ];

    const status = service.getColonyStatus(entries);

    expect(status.colonyStatus).toEqual(ColonyStatus.VARROA_OK);
    expect(status.avgCount).toEqual(3);
  });
});
