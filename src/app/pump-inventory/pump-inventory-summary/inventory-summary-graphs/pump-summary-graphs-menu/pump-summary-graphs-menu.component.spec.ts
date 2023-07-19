import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PumpSummaryGraphsMenuComponent } from './pump-summary-graphs-menu.component';

describe('PumpSummaryGraphsMenuComponent', () => {
  let component: PumpSummaryGraphsMenuComponent;
  let fixture: ComponentFixture<PumpSummaryGraphsMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PumpSummaryGraphsMenuComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PumpSummaryGraphsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
