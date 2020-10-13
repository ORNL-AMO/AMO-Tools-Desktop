import { TestBed } from '@angular/core/testing';

import { SaturatedPropertiesService } from './saturated-properties.service';

describe('SaturatedPropertiesService', () => {
  let service: SaturatedPropertiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SaturatedPropertiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
