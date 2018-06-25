import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanCurveDataHelpComponent } from './fan-curve-data-help.component';

describe('FanCurveDataHelpComponent', () => {
  let component: FanCurveDataHelpComponent;
  let fixture: ComponentFixture<FanCurveDataHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanCurveDataHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanCurveDataHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
