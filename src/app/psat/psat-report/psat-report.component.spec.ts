import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PsatReportComponent } from './psat-report.component';

describe('PsatReportComponent', () => {
  let component: PsatReportComponent;
  let fixture: ComponentFixture<PsatReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PsatReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PsatReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
