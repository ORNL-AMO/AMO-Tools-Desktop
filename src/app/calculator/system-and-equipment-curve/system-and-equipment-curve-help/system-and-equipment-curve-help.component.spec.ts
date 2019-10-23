import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemAndEquipmentCurveHelpComponent } from './system-and-equipment-curve-help.component';

describe('SystemAndEquipmentCurveHelpComponent', () => {
  let component: SystemAndEquipmentCurveHelpComponent;
  let fixture: ComponentFixture<SystemAndEquipmentCurveHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SystemAndEquipmentCurveHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemAndEquipmentCurveHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
