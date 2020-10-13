import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpportunitySummaryCopyTableComponent } from './opportunity-summary-copy-table.component';

describe('OpportunitySummaryCopyTableComponent', () => {
  let component: OpportunitySummaryCopyTableComponent;
  let fixture: ComponentFixture<OpportunitySummaryCopyTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpportunitySummaryCopyTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpportunitySummaryCopyTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
