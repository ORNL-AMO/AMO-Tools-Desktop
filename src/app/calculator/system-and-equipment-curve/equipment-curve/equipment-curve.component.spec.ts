import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipmentCurveComponent } from './equipment-curve.component';

describe('EquipmentCurveComponent', () => {
  let component: EquipmentCurveComponent;
  let fixture: ComponentFixture<EquipmentCurveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EquipmentCurveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EquipmentCurveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
