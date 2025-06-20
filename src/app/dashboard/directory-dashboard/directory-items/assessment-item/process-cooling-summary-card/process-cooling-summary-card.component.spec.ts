import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessCoolingSummaryCardComponent } from './process-cooling-summary-card.component';

describe('ProcessCoolingSummaryCardComponent', () => {
  let component: ProcessCoolingSummaryCardComponent;
  let fixture: ComponentFixture<ProcessCoolingSummaryCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcessCoolingSummaryCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessCoolingSummaryCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
