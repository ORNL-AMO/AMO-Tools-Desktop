import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreOpportunitiesSidePanelComponent } from './explore-opportunities-side-panel.component';

describe('ExploreOpportunitiesSidePanelComponent', () => {
  let component: ExploreOpportunitiesSidePanelComponent;
  let fixture: ComponentFixture<ExploreOpportunitiesSidePanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExploreOpportunitiesSidePanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExploreOpportunitiesSidePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
