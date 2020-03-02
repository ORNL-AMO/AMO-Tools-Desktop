import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreasureHuntSummaryCardComponent } from './treasure-hunt-summary-card.component';

describe('TreasureHuntSummaryCardComponent', () => {
  let component: TreasureHuntSummaryCardComponent;
  let fixture: ComponentFixture<TreasureHuntSummaryCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreasureHuntSummaryCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreasureHuntSummaryCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
