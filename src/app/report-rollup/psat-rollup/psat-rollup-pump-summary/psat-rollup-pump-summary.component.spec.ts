import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PsatRollupPumpSummaryComponent } from './psat-rollup-pump-summary.component';

describe('PsatRollupPumpSummaryComponent', () => {
  let component: PsatRollupPumpSummaryComponent;
  let fixture: ComponentFixture<PsatRollupPumpSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PsatRollupPumpSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PsatRollupPumpSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
