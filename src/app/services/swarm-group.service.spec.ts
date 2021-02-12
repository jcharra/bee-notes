import { TestBed } from '@angular/core/testing';

import { SwarmGroupService } from './swarm-group.service';

describe('SwarmGroupService', () => {
  let service: SwarmGroupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SwarmGroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
