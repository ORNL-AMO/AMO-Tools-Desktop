import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreOpportunitiesResultsComponent } from './explore-opportunities-results.component';

describe('ExploreOpportunitiesResultsComponent', () => {
  let component: ExploreOpportunitiesResultsComponent;
  let fixture: ComponentFixture<ExploreOpportunitiesResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExploreOpportunitiesResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExploreOpportunitiesResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
