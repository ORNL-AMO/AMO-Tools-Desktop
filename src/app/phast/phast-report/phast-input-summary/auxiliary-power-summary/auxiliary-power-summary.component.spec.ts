import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuxiliaryPowerSummaryComponent } from './auxiliary-power-summary.component';

describe('AuxiliaryPowerSummaryComponent', () => {
  let component: AuxiliaryPowerSummaryComponent;
  let fixture: ComponentFixture<AuxiliaryPowerSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuxiliaryPowerSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuxiliaryPowerSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
