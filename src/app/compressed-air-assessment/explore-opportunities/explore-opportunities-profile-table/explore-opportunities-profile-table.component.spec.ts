import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreOpportunitiesProfileTableComponent } from './explore-opportunities-profile-table.component';

describe('ExploreOpportunitiesProfileTableComponent', () => {
  let component: ExploreOpportunitiesProfileTableComponent;
  let fixture: ComponentFixture<ExploreOpportunitiesProfileTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExploreOpportunitiesProfileTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExploreOpportunitiesProfileTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
