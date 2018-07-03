import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanEfficiencyHelpComponent } from './fan-efficiency-help.component';

describe('FanEfficiencyHelpComponent', () => {
  let component: FanEfficiencyHelpComponent;
  let fixture: ComponentFixture<FanEfficiencyHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanEfficiencyHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanEfficiencyHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
