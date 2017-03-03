import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectoryReportComponent } from './directory-report.component';

describe('DirectoryReportComponent', () => {
  let component: DirectoryReportComponent;
  let fixture: ComponentFixture<DirectoryReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DirectoryReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DirectoryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
