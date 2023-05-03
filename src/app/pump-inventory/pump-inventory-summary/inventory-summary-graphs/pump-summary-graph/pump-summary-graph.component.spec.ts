import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PumpSummaryGraphComponent } from './pump-summary-graph.component';

describe('PumpSummaryGraphComponent', () => {
  let component: PumpSummaryGraphComponent;
  let fixture: ComponentFixture<PumpSummaryGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PumpSummaryGraphComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PumpSummaryGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
