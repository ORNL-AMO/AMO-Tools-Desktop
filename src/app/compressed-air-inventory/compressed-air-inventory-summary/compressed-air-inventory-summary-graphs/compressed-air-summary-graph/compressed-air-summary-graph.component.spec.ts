import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirSummaryGraphComponent } from './compressed-air-summary-graph.component';

describe('CompressedAirSummaryGraphComponent', () => {
  let component: CompressedAirSummaryGraphComponent;
  let fixture: ComponentFixture<CompressedAirSummaryGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompressedAirSummaryGraphComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompressedAirSummaryGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
