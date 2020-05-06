import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipmentsDropdownComponent } from './equipments-dropdown.component';

describe('EquipmentsDropdownComponent', () => {
  let component: EquipmentsDropdownComponent;
  let fixture: ComponentFixture<EquipmentsDropdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EquipmentsDropdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EquipmentsDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
