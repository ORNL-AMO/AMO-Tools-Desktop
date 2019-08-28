import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirPressureReductionCardComponent } from './compressed-air-pressure-reduction-card.component';

describe('CompressedAirPressureReductionCardComponent', () => {
  let component: CompressedAirPressureReductionCardComponent;
  let fixture: ComponentFixture<CompressedAirPressureReductionCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompressedAirPressureReductionCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompressedAirPressureReductionCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
