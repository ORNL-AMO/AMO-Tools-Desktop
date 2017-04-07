import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemCurveComponent } from './system-curve.component';

describe('SystemCurveComponent', () => {
  let component: SystemCurveComponent;
  let fixture: ComponentFixture<SystemCurveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SystemCurveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemCurveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
