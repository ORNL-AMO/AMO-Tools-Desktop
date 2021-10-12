import { TestBed } from '@angular/core/testing';

import { CalculatorDragBarService } from './calculator-drag-bar.service';

describe('CalculatorDragBarService', () => {
  let service: CalculatorDragBarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalculatorDragBarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
