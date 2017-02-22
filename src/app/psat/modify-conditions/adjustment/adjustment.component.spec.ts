/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AdjustmentComponent } from './adjustment.component';

describe('AdjustmentComponent', () => {
  let component: AdjustmentComponent;
  let fixture: ComponentFixture<AdjustmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdjustmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdjustmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
