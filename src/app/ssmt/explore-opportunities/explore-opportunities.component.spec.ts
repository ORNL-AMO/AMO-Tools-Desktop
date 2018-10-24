import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreOpportunitiesComponent } from './explore-opportunities.component';

describe('ExploreOpportunitiesComponent', () => {
  let component: ExploreOpportunitiesComponent;
  let fixture: ComponentFixture<ExploreOpportunitiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExploreOpportunitiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExploreOpportunitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
