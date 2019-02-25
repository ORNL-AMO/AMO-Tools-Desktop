import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SsmtSummaryCardComponent } from './ssmt-summary-card.component';

describe('SsmtSummaryCardComponent', () => {
  let component: SsmtSummaryCardComponent;
  let fixture: ComponentFixture<SsmtSummaryCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SsmtSummaryCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SsmtSummaryCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
