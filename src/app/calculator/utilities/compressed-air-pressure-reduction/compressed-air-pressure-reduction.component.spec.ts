import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirPressureReductionComponent } from './compressed-air-pressure-reduction.component';

describe('CompressedAirPressureReductionComponent', () => {
  let component: CompressedAirPressureReductionComponent;
  let fixture: ComponentFixture<CompressedAirPressureReductionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompressedAirPressureReductionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompressedAirPressureReductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
