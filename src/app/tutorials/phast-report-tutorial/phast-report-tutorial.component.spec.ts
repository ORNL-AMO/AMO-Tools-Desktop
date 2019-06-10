import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhastReportTutorialComponent } from './phast-report-tutorial.component';

describe('PhastReportTutorialComponent', () => {
  let component: PhastReportTutorialComponent;
  let fixture: ComponentFixture<PhastReportTutorialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhastReportTutorialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhastReportTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
