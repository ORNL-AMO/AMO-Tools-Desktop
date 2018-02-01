import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeatSystemEfficiencyHelpComponent } from './heat-system-efficiency-help.component';

describe('HeatSystemEfficiencyHelpComponent', () => {
  let component: HeatSystemEfficiencyHelpComponent;
  let fixture: ComponentFixture<HeatSystemEfficiencyHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeatSystemEfficiencyHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeatSystemEfficiencyHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
