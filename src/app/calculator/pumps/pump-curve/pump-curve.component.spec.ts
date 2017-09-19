import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PumpCurveComponent } from './pump-curve.component';

describe('PumpCurveComponent', () => {
  let component: PumpCurveComponent;
  let fixture: ComponentFixture<PumpCurveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PumpCurveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PumpCurveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
