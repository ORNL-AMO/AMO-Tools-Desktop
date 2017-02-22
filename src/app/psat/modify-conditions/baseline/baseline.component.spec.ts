/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { BaselineComponent } from './baseline.component';

describe('BaselineComponent', () => {
  let component: BaselineComponent;
  let fixture: ComponentFixture<BaselineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BaselineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BaselineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
