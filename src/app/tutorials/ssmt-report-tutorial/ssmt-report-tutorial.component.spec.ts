import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SsmtReportTutorialComponent } from './ssmt-report-tutorial.component';

describe('SsmtReportTutorialComponent', () => {
  let component: SsmtReportTutorialComponent;
  let fixture: ComponentFixture<SsmtReportTutorialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SsmtReportTutorialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SsmtReportTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
