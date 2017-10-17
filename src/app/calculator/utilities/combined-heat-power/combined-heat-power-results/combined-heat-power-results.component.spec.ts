import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CombinedHeatPowerResultsComponent } from './combined-heat-power-results.component';

describe('CombinedHeatPowerResultsComponent', () => {
  let component: CombinedHeatPowerResultsComponent;
  let fixture: ComponentFixture<CombinedHeatPowerResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CombinedHeatPowerResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CombinedHeatPowerResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
