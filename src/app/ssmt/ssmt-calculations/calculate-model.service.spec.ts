import { TestBed, inject } from '@angular/core/testing';

import { CalculateModelService } from './calculate-model.service';

describe('CalculateModelService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CalculateModelService]
    });
  });

  it('should be created', inject([CalculateModelService], (service: CalculateModelService) => {
    expect(service).toBeTruthy();
  }));
});
