import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuxEquipmentHelpComponent } from './aux-equipment-help.component';

describe('AuxEquipmentHelpComponent', () => {
  let component: AuxEquipmentHelpComponent;
  let fixture: ComponentFixture<AuxEquipmentHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuxEquipmentHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuxEquipmentHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
