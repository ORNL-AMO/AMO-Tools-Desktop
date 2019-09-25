import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanCurveFormComponent } from './fan-curve-form.component';

describe('FanCurveFormComponent', () => {
  let component: FanCurveFormComponent;
  let fixture: ComponentFixture<FanCurveFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanCurveFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanCurveFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
