import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanSystemCurveHelpComponent } from './fan-system-curve-help.component';

describe('FanSystemCurveHelpComponent', () => {
  let component: FanSystemCurveHelpComponent;
  let fixture: ComponentFixture<FanSystemCurveHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanSystemCurveHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanSystemCurveHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
