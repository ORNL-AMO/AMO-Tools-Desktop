import { TestBed, inject } from '@angular/core/testing';

import { ModelerUtilitiesService } from './modeler-utilities.service';

describe('ModelerUtilitiesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ModelerUtilitiesService]
    });
  });

  it('should be created', inject([ModelerUtilitiesService], (service: ModelerUtilitiesService) => {
    expect(service).toBeTruthy();
  }));
});
