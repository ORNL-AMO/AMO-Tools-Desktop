import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreOpportunitiesHelpComponent } from './explore-opportunities-help.component';

describe('ExploreOpportunitiesHelpComponent', () => {
  let component: ExploreOpportunitiesHelpComponent;
  let fixture: ComponentFixture<ExploreOpportunitiesHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExploreOpportunitiesHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExploreOpportunitiesHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
