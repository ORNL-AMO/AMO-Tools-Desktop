/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ElectronService } from './electron.service';

describe('ElectronService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ElectronService]
    });
  });

  it('should ...', inject([ElectronService], (service: ElectronService) => {
    expect(service).toBeTruthy();
  }));
});
