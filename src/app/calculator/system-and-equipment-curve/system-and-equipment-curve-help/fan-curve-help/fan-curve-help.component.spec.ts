import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanCurveHelpComponent } from './fan-curve-help.component';

describe('FanCurveHelpComponent', () => {
  let component: FanCurveHelpComponent;
  let fixture: ComponentFixture<FanCurveHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanCurveHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanCurveHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
