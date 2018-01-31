import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorePhastOpportunitiesHelpComponent } from './explore-phast-opportunities-help.component';

describe('ExplorePhastOpportunitiesHelpComponent', () => {
  let component: ExplorePhastOpportunitiesHelpComponent;
  let fixture: ComponentFixture<ExplorePhastOpportunitiesHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExplorePhastOpportunitiesHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExplorePhastOpportunitiesHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
