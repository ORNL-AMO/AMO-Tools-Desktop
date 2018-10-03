import { TestBed, inject } from '@angular/core/testing';

import { RunModelService } from './run-model.service';

describe('RunModelService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RunModelService]
    });
  });

  it('should be created', inject([RunModelService], (service: RunModelService) => {
    expect(service).toBeTruthy();
  }));
});
