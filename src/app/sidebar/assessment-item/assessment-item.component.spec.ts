import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentItemComponent } from './assessment-item.component';

describe('AssessmentItemComponent', () => {
  let component: AssessmentItemComponent;
  let fixture: ComponentFixture<AssessmentItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssessmentItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
