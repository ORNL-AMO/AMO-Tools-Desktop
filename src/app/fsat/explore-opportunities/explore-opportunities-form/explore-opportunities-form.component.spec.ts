import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreOpportunitiesFormComponent } from './explore-opportunities-form.component';

describe('ExploreOpportunitiesFormComponent', () => {
  let component: ExploreOpportunitiesFormComponent;
  let fixture: ComponentFixture<ExploreOpportunitiesFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExploreOpportunitiesFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExploreOpportunitiesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
