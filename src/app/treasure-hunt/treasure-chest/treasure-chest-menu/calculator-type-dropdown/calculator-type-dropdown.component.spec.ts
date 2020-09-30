import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculatorTypeDropdownComponent } from './calculator-type-dropdown.component';

describe('CalculatorTypeDropdownComponent', () => {
  let component: CalculatorTypeDropdownComponent;
  let fixture: ComponentFixture<CalculatorTypeDropdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalculatorTypeDropdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalculatorTypeDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
