import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectedAssessmentStatusComponent } from './connected-assessment-status.component';

describe('ConnectedAssessmentStatusComponent', () => {
  let component: ConnectedAssessmentStatusComponent;
  let fixture: ComponentFixture<ConnectedAssessmentStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConnectedAssessmentStatusComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectedAssessmentStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
