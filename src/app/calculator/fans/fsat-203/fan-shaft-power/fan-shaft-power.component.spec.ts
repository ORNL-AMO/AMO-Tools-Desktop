import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanShaftPowerComponent } from './fan-shaft-power.component';

describe('FanShaftPowerComponent', () => {
  let component: FanShaftPowerComponent;
  let fixture: ComponentFixture<FanShaftPowerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanShaftPowerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanShaftPowerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
