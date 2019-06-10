import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PsatReportTutorialComponent } from './psat-report-tutorial.component';

describe('PsatReportTutorialComponent', () => {
  let component: PsatReportTutorialComponent;
  let fixture: ComponentFixture<PsatReportTutorialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PsatReportTutorialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PsatReportTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
