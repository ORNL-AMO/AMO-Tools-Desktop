import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailedReportComponent } from './detailed-report.component';

describe('DetailedReportComponent', () => {
  let component: DetailedReportComponent;
  let fixture: ComponentFixture<DetailedReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetailedReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailedReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
