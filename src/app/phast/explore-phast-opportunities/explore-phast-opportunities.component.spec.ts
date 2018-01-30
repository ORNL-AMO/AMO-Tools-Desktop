import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorePhastOpportunitiesComponent } from './explore-phast-opportunities.component';

describe('ExplorePhastOpportunitiesComponent', () => {
  let component: ExplorePhastOpportunitiesComponent;
  let fixture: ComponentFixture<ExplorePhastOpportunitiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExplorePhastOpportunitiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExplorePhastOpportunitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
