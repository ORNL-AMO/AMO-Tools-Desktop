import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorePhastOpportunitiesResultsComponent } from './explore-phast-opportunities-results.component';

describe('ExplorePhastOpportunitiesResultsComponent', () => {
  let component: ExplorePhastOpportunitiesResultsComponent;
  let fixture: ComponentFixture<ExplorePhastOpportunitiesResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExplorePhastOpportunitiesResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExplorePhastOpportunitiesResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
