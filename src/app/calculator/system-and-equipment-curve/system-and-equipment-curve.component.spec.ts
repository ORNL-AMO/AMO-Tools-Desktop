import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemAndEquipmentCurveComponent } from './system-and-equipment-curve.component';

describe('SystemAndEquipmentCurveComponent', () => {
  let component: SystemAndEquipmentCurveComponent;
  let fixture: ComponentFixture<SystemAndEquipmentCurveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SystemAndEquipmentCurveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemAndEquipmentCurveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
