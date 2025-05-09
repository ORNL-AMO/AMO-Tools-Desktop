import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashFlowResultsComponent } from './cash-flow-results.component';

describe('CashFlowResultsComponent', () => {
  let component: CashFlowResultsComponent;
  let fixture: ComponentFixture<CashFlowResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashFlowResultsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CashFlowResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
