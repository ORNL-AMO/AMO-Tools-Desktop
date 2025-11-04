import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldMeasurementsCatalogComponent } from './field-measurements-catalog.component';

describe('FieldMeasurementsCatalogComponent', () => {
  let component: FieldMeasurementsCatalogComponent;
  let fixture: ComponentFixture<FieldMeasurementsCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldMeasurementsCatalogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldMeasurementsCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
