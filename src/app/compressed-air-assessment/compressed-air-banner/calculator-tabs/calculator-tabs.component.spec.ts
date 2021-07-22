import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculatorTabsComponent } from './calculator-tabs.component';

describe('CalculatorTabsComponent', () => {
  let component: CalculatorTabsComponent;
  let fixture: ComponentFixture<CalculatorTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CalculatorTabsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CalculatorTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
