/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AssessmentComponent } from './assessment.component';

describe('AssessmentComponent', () => {
  let component: AssessmentComponent;
  let fixture: ComponentFixture<AssessmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssessmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
