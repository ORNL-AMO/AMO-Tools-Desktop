import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectedAssessmentComponent } from './connected-assessment.component';

describe('ConnectedAssessmentComponent', () => {
  let component: ConnectedAssessmentComponent;
  let fixture: ComponentFixture<ConnectedAssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConnectedAssessmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectedAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
