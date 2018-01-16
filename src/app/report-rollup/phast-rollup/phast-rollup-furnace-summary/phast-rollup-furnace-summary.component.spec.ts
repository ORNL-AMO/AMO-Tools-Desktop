import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhastRollupFurnaceSummaryComponent } from './phast-rollup-furnace-summary.component';

describe('PhastRollupFurnaceSummaryComponent', () => {
  let component: PhastRollupFurnaceSummaryComponent;
  let fixture: ComponentFixture<PhastRollupFurnaceSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhastRollupFurnaceSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhastRollupFurnaceSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
