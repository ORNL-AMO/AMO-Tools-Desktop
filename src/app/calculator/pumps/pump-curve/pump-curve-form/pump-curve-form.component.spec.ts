import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PumpCurveFormComponent } from './pump-curve-form.component';

describe('PumpCurveFormComponent', () => {
  let component: PumpCurveFormComponent;
  let fixture: ComponentFixture<PumpCurveFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PumpCurveFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PumpCurveFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
