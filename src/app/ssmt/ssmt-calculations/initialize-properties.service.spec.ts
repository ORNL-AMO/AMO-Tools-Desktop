import { TestBed, inject } from '@angular/core/testing';

import { InitializePropertiesService } from './initialize-properties.service';

describe('InitializePropertiesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InitializePropertiesService]
    });
  });

  it('should be created', inject([InitializePropertiesService], (service: InitializePropertiesService) => {
    expect(service).toBeTruthy();
  }));
});
