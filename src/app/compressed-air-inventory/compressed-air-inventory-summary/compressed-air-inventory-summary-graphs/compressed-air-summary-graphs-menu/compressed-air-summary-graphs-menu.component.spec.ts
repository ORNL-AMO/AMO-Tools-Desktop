import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirSummaryGraphsMenuComponent } from './compressed-air-summary-graphs-menu.component';

describe('CompressedAirSummaryGraphsMenuComponent', () => {
  let component: CompressedAirSummaryGraphsMenuComponent;
  let fixture: ComponentFixture<CompressedAirSummaryGraphsMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompressedAirSummaryGraphsMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompressedAirSummaryGraphsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
