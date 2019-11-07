import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PumpSystemCurveFormComponent } from './pump-system-curve-form.component';

describe('PumpSystemCurveFormComponent', () => {
  let component: PumpSystemCurveFormComponent;
  let fixture: ComponentFixture<PumpSystemCurveFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PumpSystemCurveFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PumpSystemCurveFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
