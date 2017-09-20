import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhastReportComponent } from './phast-report.component';

describe('PhastReportComponent', () => {
  let component: PhastReportComponent;
  let fixture: ComponentFixture<PhastReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhastReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhastReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
