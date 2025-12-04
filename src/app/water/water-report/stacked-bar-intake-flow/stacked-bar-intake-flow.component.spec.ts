import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StackedBarIntakeFlowComponent } from './stacked-bar-intake-flow.component';

describe('StackedBarIntakeFlowComponent', () => {
  let component: StackedBarIntakeFlowComponent;
  let fixture: ComponentFixture<StackedBarIntakeFlowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StackedBarIntakeFlowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StackedBarIntakeFlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
