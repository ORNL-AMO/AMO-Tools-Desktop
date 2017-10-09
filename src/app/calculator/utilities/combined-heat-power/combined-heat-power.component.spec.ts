import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CombinedHeatPowerComponent } from './combined-heat-power.component';

describe('CombinedHeatPowerComponent', () => {
  let component: CombinedHeatPowerComponent;
  let fixture: ComponentFixture<CombinedHeatPowerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CombinedHeatPowerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CombinedHeatPowerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
