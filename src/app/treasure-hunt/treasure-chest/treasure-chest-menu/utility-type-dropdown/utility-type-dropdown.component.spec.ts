import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UtilityTypeDropdownComponent } from './utility-type-dropdown.component';

describe('UtilityTypeDropdownComponent', () => {
  let component: UtilityTypeDropdownComponent;
  let fixture: ComponentFixture<UtilityTypeDropdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UtilityTypeDropdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtilityTypeDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
