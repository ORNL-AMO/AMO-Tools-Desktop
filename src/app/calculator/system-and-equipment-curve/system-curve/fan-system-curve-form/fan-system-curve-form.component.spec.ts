import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanSystemCurveFormComponent } from './fan-system-curve-form.component';

describe('FanSystemCurveFormComponent', () => {
  let component: FanSystemCurveFormComponent;
  let fixture: ComponentFixture<FanSystemCurveFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanSystemCurveFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanSystemCurveFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
