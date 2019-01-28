import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SsmtReportComponent } from './ssmt-report.component';

describe('SsmtReportComponent', () => {
  let component: SsmtReportComponent;
  let fixture: ComponentFixture<SsmtReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SsmtReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SsmtReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
