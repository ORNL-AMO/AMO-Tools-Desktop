import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhastCalculatorTabsComponent } from './phast-calculator-tabs.component';

describe('PhastCalculatorTabsComponent', () => {
  let component: PhastCalculatorTabsComponent;
  let fixture: ComponentFixture<PhastCalculatorTabsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhastCalculatorTabsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhastCalculatorTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
