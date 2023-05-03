import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PumpEquipmentPropertiesComponent } from './pump-equipment-properties.component';

describe('PumpEquipmentPropertiesComponent', () => {
  let component: PumpEquipmentPropertiesComponent;
  let fixture: ComponentFixture<PumpEquipmentPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PumpEquipmentPropertiesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PumpEquipmentPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
