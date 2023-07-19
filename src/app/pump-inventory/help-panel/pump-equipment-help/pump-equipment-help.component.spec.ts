import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PumpEquipmentHelpComponent } from './pump-equipment-help.component';

describe('PumpEquipmentHelpComponent', () => {
  let component: PumpEquipmentHelpComponent;
  let fixture: ComponentFixture<PumpEquipmentHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PumpEquipmentHelpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PumpEquipmentHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
