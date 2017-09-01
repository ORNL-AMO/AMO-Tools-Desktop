import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuxEquipmentFormComponent } from './aux-equipment-form.component';

describe('AuxEquipmentFormComponent', () => {
  let component: AuxEquipmentFormComponent;
  let fixture: ComponentFixture<AuxEquipmentFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuxEquipmentFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuxEquipmentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
