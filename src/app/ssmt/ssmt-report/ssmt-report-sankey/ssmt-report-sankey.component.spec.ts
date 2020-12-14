import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SsmtReportSankeyComponent } from './ssmt-report-sankey.component';

describe('SsmtReportSankeyComponent', () => {
  let component: SsmtReportSankeyComponent;
  let fixture: ComponentFixture<SsmtReportSankeyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SsmtReportSankeyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SsmtReportSankeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
