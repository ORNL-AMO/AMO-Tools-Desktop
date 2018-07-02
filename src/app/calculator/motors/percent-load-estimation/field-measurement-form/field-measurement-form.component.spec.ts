import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldMeasurementFormComponent } from './field-measurement-form.component';

describe('FieldMeasurementFormComponent', () => {
  let component: FieldMeasurementFormComponent;
  let fixture: ComponentFixture<FieldMeasurementFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldMeasurementFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldMeasurementFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
