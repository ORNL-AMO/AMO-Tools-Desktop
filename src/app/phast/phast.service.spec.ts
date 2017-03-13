import { TestBed, inject } from '@angular/core/testing';

import { PhastService } from './phast.service';

describe('PhastService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PhastService]
    });
  });

  it('should ...', inject([PhastService], (service: PhastService) => {
    expect(service).toBeTruthy();
  }));

  it('water cooling losses', inject([PhastService], (service: PhastService) => {
    expect(service.waterCoolingLosses(100.0, 80.0, 120.0, 1.0)).toBe(1989032);
  }))

  it('fixture losses', inject([PhastService], (service: PhastService) => {
    expect(service.fixtureLosses(0.122, 1250.0, 300.0, 1800.0, 1.0)).toBe(228750.0);
  }))

  it('gas cooling losses 1', inject([PhastService], (service: PhastService) => {
    expect(service.gasCoolingLosses(2500.0, 80.0, 280.0, 0.02, 1.0)).toBe(600000.0);
  }))

  it('gas cooling losses 2', inject([PhastService], (service: PhastService) => {
    expect(service.gasCoolingLosses(600, 80.0, 350.0, 0.02, 1.0)).toBe(194400.0);
  }))

  it('gas load charge material', inject([PhastService], (service: PhastService) => {
    expect(service.gasLoadChargeMaterial(0, 0.24, 1000.0, 15.0, 80.0, 1150.0, 0.5, 100.0, 80.0, 5000.0)).toBe(383530.0);
  }))

});
