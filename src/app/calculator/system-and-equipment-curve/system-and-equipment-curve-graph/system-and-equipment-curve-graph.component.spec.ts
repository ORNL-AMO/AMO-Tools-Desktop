import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemAndEquipmentCurveGraphComponent } from './system-and-equipment-curve-graph.component';

describe('SystemAndEquipmentCurveGraphComponent', () => {
  let component: SystemAndEquipmentCurveGraphComponent;
  let fixture: ComponentFixture<SystemAndEquipmentCurveGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SystemAndEquipmentCurveGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemAndEquipmentCurveGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
