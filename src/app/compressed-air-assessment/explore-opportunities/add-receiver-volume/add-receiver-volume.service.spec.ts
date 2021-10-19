import { TestBed } from '@angular/core/testing';

import { AddReceiverVolumeService } from './add-receiver-volume.service';

describe('AddReceiverVolumeService', () => {
  let service: AddReceiverVolumeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddReceiverVolumeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
