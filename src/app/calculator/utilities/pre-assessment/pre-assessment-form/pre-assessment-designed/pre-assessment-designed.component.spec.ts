import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreAssessmentDesignedComponent } from './pre-assessment-designed.component';

describe('PreAssessmentDesignedComponent', () => {
  let component: PreAssessmentDesignedComponent;
  let fixture: ComponentFixture<PreAssessmentDesignedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreAssessmentDesignedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreAssessmentDesignedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
