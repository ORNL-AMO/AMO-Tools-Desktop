import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirPressureReductionHelpComponent } from './compressed-air-pressure-reduction-help.component';

describe('CompressedAirPressureReductionHelpComponent', () => {
  let component: CompressedAirPressureReductionHelpComponent;
  let fixture: ComponentFixture<CompressedAirPressureReductionHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompressedAirPressureReductionHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompressedAirPressureReductionHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
