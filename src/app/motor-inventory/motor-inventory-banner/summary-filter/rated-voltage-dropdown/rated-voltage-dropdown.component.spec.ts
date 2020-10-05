import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RatedVoltageDropdownComponent } from './rated-voltage-dropdown.component';

describe('RatedVoltageDropdownComponent', () => {
  let component: RatedVoltageDropdownComponent;
  let fixture: ComponentFixture<RatedVoltageDropdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RatedVoltageDropdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RatedVoltageDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
