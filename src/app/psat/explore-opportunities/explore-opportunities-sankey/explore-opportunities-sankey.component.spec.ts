import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreOpportunitiesSankeyComponent } from './explore-opportunities-sankey.component';

describe('ExploreOpportunitiesSankeyComponent', () => {
  let component: ExploreOpportunitiesSankeyComponent;
  let fixture: ComponentFixture<ExploreOpportunitiesSankeyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExploreOpportunitiesSankeyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExploreOpportunitiesSankeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
