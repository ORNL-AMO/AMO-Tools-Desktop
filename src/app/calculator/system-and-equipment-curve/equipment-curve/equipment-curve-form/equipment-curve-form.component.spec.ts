import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipmentCurveFormComponent } from './equipment-curve-form.component';

describe('EquipmentCurveFormComponent', () => {
  let component: EquipmentCurveFormComponent;
  let fixture: ComponentFixture<EquipmentCurveFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EquipmentCurveFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EquipmentCurveFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
