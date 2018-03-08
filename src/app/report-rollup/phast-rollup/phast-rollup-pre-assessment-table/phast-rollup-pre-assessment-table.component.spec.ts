import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhastRollupPreAssessmentTableComponent } from './phast-rollup-pre-assessment-table.component';

describe('PhastRollupPreAssessmentTableComponent', () => {
  let component: PhastRollupPreAssessmentTableComponent;
  let fixture: ComponentFixture<PhastRollupPreAssessmentTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhastRollupPreAssessmentTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhastRollupPreAssessmentTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
