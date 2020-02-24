import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportRollupModalsComponent } from './report-rollup-modals.component';

describe('ReportRollupModalsComponent', () => {
  let component: ReportRollupModalsComponent;
  let fixture: ComponentFixture<ReportRollupModalsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportRollupModalsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportRollupModalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
