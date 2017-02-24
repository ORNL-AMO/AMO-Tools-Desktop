/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AddonService } from './addon.service';

describe('AddonService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AddonService]
    });
  });

  it('should ...', inject([AddonService], (service: AddonService) => {
    expect(service).toBeTruthy();
  }));
});
