import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemCurveFormComponent } from './system-curve-form.component';

describe('SystemCurveFormComponent', () => {
  let component: SystemCurveFormComponent;
  let fixture: ComponentFixture<SystemCurveFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SystemCurveFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemCurveFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
