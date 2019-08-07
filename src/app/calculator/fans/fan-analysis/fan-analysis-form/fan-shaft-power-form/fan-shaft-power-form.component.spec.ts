import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanShaftPowerFormComponent } from './fan-shaft-power-form.component';

describe('FanShaftPowerFormComponent', () => {
  let component: FanShaftPowerFormComponent;
  let fixture: ComponentFixture<FanShaftPowerFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanShaftPowerFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanShaftPowerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
