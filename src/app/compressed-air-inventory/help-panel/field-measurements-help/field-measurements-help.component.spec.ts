import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldMeasurementsHelpComponent } from './field-measurements-help.component';

describe('FieldMeasurementsHelpComponent', () => {
  let component: FieldMeasurementsHelpComponent;
  let fixture: ComponentFixture<FieldMeasurementsHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldMeasurementsHelpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldMeasurementsHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
