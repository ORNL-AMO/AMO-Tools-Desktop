import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldMeasurementTableComponent } from './field-measurement-table.component';

describe('FieldMeasurementTableComponent', () => {
  let component: FieldMeasurementTableComponent;
  let fixture: ComponentFixture<FieldMeasurementTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldMeasurementTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldMeasurementTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
