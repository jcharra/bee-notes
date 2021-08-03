import { TestBed } from '@angular/core/testing';

import { StorageSyncService } from './storage-sync.service';

describe('StorageSyncService', () => {
  let service: StorageSyncService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageSyncService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
