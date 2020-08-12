import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EfficiencyClassDropdownComponent } from './efficiency-class-dropdown.component';

describe('EfficiencyClassDropdownComponent', () => {
  let component: EfficiencyClassDropdownComponent;
  let fixture: ComponentFixture<EfficiencyClassDropdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EfficiencyClassDropdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EfficiencyClassDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
