import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreasureHuntReportComponent } from './treasure-hunt-report.component';

describe('TreasureHuntReportComponent', () => {
  let component: TreasureHuntReportComponent;
  let fixture: ComponentFixture<TreasureHuntReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreasureHuntReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreasureHuntReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
