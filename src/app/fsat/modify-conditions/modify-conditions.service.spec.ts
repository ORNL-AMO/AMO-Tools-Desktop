import { TestBed, inject } from '@angular/core/testing';

import { ModifyConditionsService } from './modify-conditions.service';

describe('ModifyConditionsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ModifyConditionsService]
    });
  });

  it('should be created', inject([ModifyConditionsService], (service: ModifyConditionsService) => {
    expect(service).toBeTruthy();
  }));
});
