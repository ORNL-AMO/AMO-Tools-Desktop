import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpportunitySheetResultsComponent } from './opportunity-sheet-results.component';

describe('OpportunitySheetResultsComponent', () => {
  let component: OpportunitySheetResultsComponent;
  let fixture: ComponentFixture<OpportunitySheetResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpportunitySheetResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpportunitySheetResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
