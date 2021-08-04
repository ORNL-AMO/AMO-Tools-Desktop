import { ComponentFixture, TestBed } from '@angular/core/testing';

import { O2UtilizationRateFormComponent } from './o2-utilization-rate-form.component';

describe('O2UtilizationRateFormComponent', () => {
  let component: O2UtilizationRateFormComponent;
  let fixture: ComponentFixture<O2UtilizationRateFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ O2UtilizationRateFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(O2UtilizationRateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
