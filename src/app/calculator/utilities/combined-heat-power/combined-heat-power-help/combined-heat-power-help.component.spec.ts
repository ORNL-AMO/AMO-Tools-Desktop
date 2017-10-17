import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CombinedHeatPowerHelpComponent } from './combined-heat-power-help.component';

describe('CombinedHeatPowerHelpComponent', () => {
  let component: CombinedHeatPowerHelpComponent;
  let fixture: ComponentFixture<CombinedHeatPowerHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CombinedHeatPowerHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CombinedHeatPowerHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
