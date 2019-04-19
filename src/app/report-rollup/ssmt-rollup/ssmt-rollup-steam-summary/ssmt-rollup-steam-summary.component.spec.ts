import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SsmtRollupSteamSummaryComponent } from './ssmt-rollup-steam-summary.component';

describe('SsmtRollupSteamSummaryComponent', () => {
  let component: SsmtRollupSteamSummaryComponent;
  let fixture: ComponentFixture<SsmtRollupSteamSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SsmtRollupSteamSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SsmtRollupSteamSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
