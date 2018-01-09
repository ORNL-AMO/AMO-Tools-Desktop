import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GasLeakageSummaryComponent } from './gas-leakage-summary.component';

describe('GasLeakageSummaryComponent', () => {
  let component: GasLeakageSummaryComponent;
  let fixture: ComponentFixture<GasLeakageSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GasLeakageSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GasLeakageSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
