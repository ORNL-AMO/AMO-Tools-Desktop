import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportRollupUnitsComponent } from './report-rollup-units.component';

describe('ReportRollupUnitsComponent', () => {
  let component: ReportRollupUnitsComponent;
  let fixture: ComponentFixture<ReportRollupUnitsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportRollupUnitsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportRollupUnitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
