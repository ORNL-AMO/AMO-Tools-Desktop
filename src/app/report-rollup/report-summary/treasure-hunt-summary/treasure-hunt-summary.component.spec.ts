import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreasureHuntSummaryComponent } from './treasure-hunt-summary.component';

describe('TreasureHuntSummaryComponent', () => {
  let component: TreasureHuntSummaryComponent;
  let fixture: ComponentFixture<TreasureHuntSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreasureHuntSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreasureHuntSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
