import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentTabContentComponent } from './assessment-tab-content.component';

describe('AssessmentTabContentComponent', () => {
  let component: AssessmentTabContentComponent;
  let fixture: ComponentFixture<AssessmentTabContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssessmentTabContentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessmentTabContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
