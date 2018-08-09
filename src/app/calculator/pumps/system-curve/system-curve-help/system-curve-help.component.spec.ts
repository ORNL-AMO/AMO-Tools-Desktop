import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemCurveHelpComponent } from './system-curve-help.component';

describe('SystemCurveHelpComponent', () => {
  let component: SystemCurveHelpComponent;
  let fixture: ComponentFixture<SystemCurveHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SystemCurveHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemCurveHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
