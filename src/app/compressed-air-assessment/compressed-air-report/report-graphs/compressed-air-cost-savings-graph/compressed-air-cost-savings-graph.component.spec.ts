import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirCostSavingsGraphComponent } from './compressed-air-cost-savings-graph.component';

describe('CompressedAirCostSavingsGraphComponent', () => {
  let component: CompressedAirCostSavingsGraphComponent;
  let fixture: ComponentFixture<CompressedAirCostSavingsGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompressedAirCostSavingsGraphComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompressedAirCostSavingsGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
