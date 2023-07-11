import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldMeasurementsPropertiesComponent } from './field-measurements-properties.component';

describe('FieldMeasurementsPropertiesComponent', () => {
  let component: FieldMeasurementsPropertiesComponent;
  let fixture: ComponentFixture<FieldMeasurementsPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FieldMeasurementsPropertiesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldMeasurementsPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
