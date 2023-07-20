import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentIntegrationStatusComponent } from './assessment-integration-status.component';

describe('AssessmentIntegrationStatusComponent', () => {
  let component: AssessmentIntegrationStatusComponent;
  let fixture: ComponentFixture<AssessmentIntegrationStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssessmentIntegrationStatusComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessmentIntegrationStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
