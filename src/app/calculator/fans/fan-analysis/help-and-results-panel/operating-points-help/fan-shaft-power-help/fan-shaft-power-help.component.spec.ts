import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanShaftPowerHelpComponent } from './fan-shaft-power-help.component';

describe('FanShaftPowerHelpComponent', () => {
  let component: FanShaftPowerHelpComponent;
  let fixture: ComponentFixture<FanShaftPowerHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanShaftPowerHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanShaftPowerHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
