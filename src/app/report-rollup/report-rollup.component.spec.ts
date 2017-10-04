import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportRollupComponent } from './report-rollup.component';

describe('ReportRollupComponent', () => {
  let component: ReportRollupComponent;
  let fixture: ComponentFixture<ReportRollupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportRollupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportRollupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
