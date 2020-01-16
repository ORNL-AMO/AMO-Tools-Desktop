import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculatorListComponent } from './calculator-list.component';

describe('CalculatorListComponent', () => {
  let component: CalculatorListComponent;
  let fixture: ComponentFixture<CalculatorListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalculatorListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalculatorListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
