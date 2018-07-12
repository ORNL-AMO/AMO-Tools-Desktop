import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FsatRollupFanSummaryComponent } from './fsat-rollup-fan-summary.component';

describe('FsatRollupFanSummaryComponent', () => {
  let component: FsatRollupFanSummaryComponent;
  let fixture: ComponentFixture<FsatRollupFanSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FsatRollupFanSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FsatRollupFanSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
