import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentHelpComponent } from './assessment-help.component';

describe('AssessmentHelpComponent', () => {
  let component: AssessmentHelpComponent;
  let fixture: ComponentFixture<AssessmentHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssessmentHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
