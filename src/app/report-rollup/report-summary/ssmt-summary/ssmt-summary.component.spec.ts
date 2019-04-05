import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SsmtSummaryComponent } from './ssmt-summary.component';

describe('SsmtSummaryComponent', () => {
  let component: SsmtSummaryComponent;
  let fixture: ComponentFixture<SsmtSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SsmtSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SsmtSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
