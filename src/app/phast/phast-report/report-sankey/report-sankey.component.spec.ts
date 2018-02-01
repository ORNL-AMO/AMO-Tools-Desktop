import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportSankeyComponent } from './report-sankey.component';

describe('ReportSankeyComponent', () => {
  let component: ReportSankeyComponent;
  let fixture: ComponentFixture<ReportSankeyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportSankeyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportSankeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
