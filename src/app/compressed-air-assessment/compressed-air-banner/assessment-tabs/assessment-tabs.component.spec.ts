import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentTabsComponent } from './assessment-tabs.component';

describe('AssessmentTabsComponent', () => {
  let component: AssessmentTabsComponent;
  let fixture: ComponentFixture<AssessmentTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssessmentTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessmentTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
