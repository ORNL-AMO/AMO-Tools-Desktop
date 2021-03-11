import { ComponentFixture, TestBed } from '@angular/core/testing';

import { O2UtilizationRateHelpComponent } from './o2-utilization-rate-help.component';

describe('O2UtilizationRateHelpComponent', () => {
  let component: O2UtilizationRateHelpComponent;
  let fixture: ComponentFixture<O2UtilizationRateHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ O2UtilizationRateHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(O2UtilizationRateHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
