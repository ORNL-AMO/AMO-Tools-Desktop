import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExhaustGasSummaryComponent } from './exhaust-gas-summary.component';

describe('ExhaustGasSummaryComponent', () => {
  let component: ExhaustGasSummaryComponent;
  let fixture: ComponentFixture<ExhaustGasSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExhaustGasSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExhaustGasSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
