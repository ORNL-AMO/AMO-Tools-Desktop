import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorePhastOpportunitiesFormComponent } from './explore-phast-opportunities-form.component';

describe('ExplorePhastOpportunitiesFormComponent', () => {
  let component: ExplorePhastOpportunitiesFormComponent;
  let fixture: ComponentFixture<ExplorePhastOpportunitiesFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExplorePhastOpportunitiesFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExplorePhastOpportunitiesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
