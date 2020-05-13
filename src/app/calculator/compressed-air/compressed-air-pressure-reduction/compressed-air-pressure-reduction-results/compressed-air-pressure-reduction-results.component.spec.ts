import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirPressureReductionResultsComponent } from './compressed-air-pressure-reduction-results.component';

describe('CompressedAirPressureReductionResultsComponent', () => {
  let component: CompressedAirPressureReductionResultsComponent;
  let fixture: ComponentFixture<CompressedAirPressureReductionResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompressedAirPressureReductionResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompressedAirPressureReductionResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
