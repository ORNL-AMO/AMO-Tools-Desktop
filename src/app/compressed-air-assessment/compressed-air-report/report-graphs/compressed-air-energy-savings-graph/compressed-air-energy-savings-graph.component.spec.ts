import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirEnergySavingsGraphComponent } from './compressed-air-energy-savings-graph.component';

describe('CompressedAirEnergySavingsGraphComponent', () => {
  let component: CompressedAirEnergySavingsGraphComponent;
  let fixture: ComponentFixture<CompressedAirEnergySavingsGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompressedAirEnergySavingsGraphComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompressedAirEnergySavingsGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
