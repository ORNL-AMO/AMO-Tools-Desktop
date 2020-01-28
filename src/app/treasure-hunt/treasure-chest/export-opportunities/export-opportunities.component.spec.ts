import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportOpportunitiesComponent } from './export-opportunities.component';

describe('ExportOpportunitiesComponent', () => {
  let component: ExportOpportunitiesComponent;
  let fixture: ComponentFixture<ExportOpportunitiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportOpportunitiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportOpportunitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
