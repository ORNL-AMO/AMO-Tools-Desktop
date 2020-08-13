import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirPressureReductionFormComponent } from './compressed-air-pressure-reduction-form.component';

describe('CompressedAirPressureReductionFormComponent', () => {
  let component: CompressedAirPressureReductionFormComponent;
  let fixture: ComponentFixture<CompressedAirPressureReductionFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompressedAirPressureReductionFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompressedAirPressureReductionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
