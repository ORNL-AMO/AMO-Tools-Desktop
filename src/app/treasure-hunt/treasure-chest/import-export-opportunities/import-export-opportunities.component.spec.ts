import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportExportOpportunitiesComponent } from './import-export-opportunities.component';

describe('ImportExportOpportunitiesComponent', () => {
  let component: ImportExportOpportunitiesComponent;
  let fixture: ComponentFixture<ImportExportOpportunitiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportExportOpportunitiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportExportOpportunitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
