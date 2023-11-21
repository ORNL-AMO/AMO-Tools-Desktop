import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentIntegrationComponent } from './assessment-integration.component';

describe('AssessmentIntegrationComponent', () => {
  let component: AssessmentIntegrationComponent;
  let fixture: ComponentFixture<AssessmentIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssessmentIntegrationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessmentIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
