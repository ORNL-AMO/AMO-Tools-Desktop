import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PumpSystemCurveHelpComponent } from './pump-system-curve-help.component';

describe('PumpSystemCurveHelpComponent', () => {
  let component: PumpSystemCurveHelpComponent;
  let fixture: ComponentFixture<PumpSystemCurveHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PumpSystemCurveHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PumpSystemCurveHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
