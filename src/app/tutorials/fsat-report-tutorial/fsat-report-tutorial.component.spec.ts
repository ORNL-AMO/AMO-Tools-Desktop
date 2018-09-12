import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FsatReportTutorialComponent } from './fsat-report-tutorial.component';

describe('FsatReportTutorialComponent', () => {
  let component: FsatReportTutorialComponent;
  let fixture: ComponentFixture<FsatReportTutorialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FsatReportTutorialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FsatReportTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
