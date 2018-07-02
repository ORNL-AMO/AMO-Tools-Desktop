import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PumpCurveHelpComponent } from './pump-curve-help.component';

describe('PumpCurveHelpComponent', () => {
  let component: PumpCurveHelpComponent;
  let fixture: ComponentFixture<PumpCurveHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PumpCurveHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PumpCurveHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
