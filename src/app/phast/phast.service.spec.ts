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
    console.log(service);
    expect(service.waterCoolingLosses(100.0, 80.0, 120.0, 1.0)).toBe(1989032);
  }));

  it('fixture losses', inject([PhastService], (service: PhastService) => {
    expect(service.fixtureLosses(0.122, 1250.0, 300.0, 1800.0, 1.0)).toBe(228750.0);
  }));

  // it('gas cooling losses 1', inject([PhastService], (service: PhastService) => {
  //   expect(service.gasCoolingLosses(2500.0, 80.0, 280.0, 0.02, 1.0)).toBe(600000.0);
  // }));

  // it('gas cooling losses 2', inject([PhastService], (service: PhastService) => {
  //   expect(service.gasCoolingLosses(600, 80.0, 350.0, 0.02, 1.0)).toBe(194400.0);
  // }));

  it('gas load charge material', inject([PhastService], (service: PhastService) => {
    expect(service.gasLoadChargeMaterial(0, 0.24, 1000.0, 15.0, 80.0, 1150.0, 0.5, 100.0, 80.0, 5000.0)).toBe(383530.0);
  }));

  // it('liquid cooling losses', inject([PhastService], (service: PhastService) => {
  //   expect(service.liquidCoolingLosses(100.0, 9.35, 80.0, 210.0, 0.52, 1.0)).toBe(3792360.0);
  // }));

  it('liquid load charge material', inject([PhastService], (service: PhastService) => {
    expect(service.liquidLoadChargeMaterial(0, 0.48, 240.0, 250.0, 0.25, 1000.0, 70.0, 320.0, 100.0, 25.0, 50.0, 0)).toBe(364100);
  }));

  it('opening losses', inject([PhastService], (service: PhastService) => {
    expect(service.openingLosses(12.0, 9.0, 1.33, 75.0, 1600.0, 100.0, 0.70, 8)).toBe(16038.0);
  }));

  it('solid load charge material', inject([PhastService], (service: PhastService) => {
    expect(service.solidLoadChargeMaterial(1, 0.150, 60.0, 0.481, 2900.0, 10000.0, 0.1, 0.0, 70.0, 2200.0, 500.0, 0.0, 1.0, 100, 0)).toBe(3204310);
  }));

  it('wall losses', inject([PhastService], (service: PhastService) => {
    expect(service.wallLosses(500.0, 80.0, 225.0, 10.0, 0.9, 1.394, 1.0)).toBe(399122.25367509428);
  }));

   it('water cooling losses', inject([PhastService], (service: PhastService) => {
    expect(service.waterCoolingLosses(100.0, 80.0, 120.0, 1.0)).toBe(1989032);
  }));

});
