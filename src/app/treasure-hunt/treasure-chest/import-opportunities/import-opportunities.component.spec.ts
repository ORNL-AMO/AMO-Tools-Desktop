import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportOpportunitiesComponent } from './import-opportunities.component';

describe('ImportOpportunitiesComponent', () => {
  let component: ImportOpportunitiesComponent;
  let fixture: ComponentFixture<ImportOpportunitiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportOpportunitiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportOpportunitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
