/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AdjustmentFieldDataComponent } from './adjustment-field-data.component';

describe('AdjustmentFieldDataComponent', () => {
  let component: AdjustmentFieldDataComponent;
  let fixture: ComponentFixture<AdjustmentFieldDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdjustmentFieldDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdjustmentFieldDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
