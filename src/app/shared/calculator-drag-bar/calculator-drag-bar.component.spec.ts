import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculatorDragBarComponent } from './calculator-drag-bar.component';

describe('CalculatorDragBarComponent', () => {
  let component: CalculatorDragBarComponent;
  let fixture: ComponentFixture<CalculatorDragBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CalculatorDragBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CalculatorDragBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
