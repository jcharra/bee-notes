import { TestBed } from '@angular/core/testing';

import { AppreviewService } from './appreview.service';

describe('AppreviewService', () => {
  let service: AppreviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppreviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
