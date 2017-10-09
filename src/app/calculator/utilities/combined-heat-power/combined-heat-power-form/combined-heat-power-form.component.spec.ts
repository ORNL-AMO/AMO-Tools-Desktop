import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CombinedHeatPowerFormComponent } from './combined-heat-power-form.component';

describe('CombinedHeatPowerFormComponent', () => {
  let component: CombinedHeatPowerFormComponent;
  let fixture: ComponentFixture<CombinedHeatPowerFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CombinedHeatPowerFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CombinedHeatPowerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
