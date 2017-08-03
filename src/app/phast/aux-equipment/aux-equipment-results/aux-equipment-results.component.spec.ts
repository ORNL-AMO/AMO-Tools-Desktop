import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuxEquipmentResultsComponent } from './aux-equipment-results.component';

describe('AuxEquipmentResultsComponent', () => {
  let component: AuxEquipmentResultsComponent;
  let fixture: ComponentFixture<AuxEquipmentResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuxEquipmentResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuxEquipmentResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
