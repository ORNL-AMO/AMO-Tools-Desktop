import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreasureHuntReportTutorialComponent } from './treasure-hunt-report-tutorial.component';

describe('TreasureHuntReportTutorialComponent', () => {
  let component: TreasureHuntReportTutorialComponent;
  let fixture: ComponentFixture<TreasureHuntReportTutorialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreasureHuntReportTutorialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreasureHuntReportTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
