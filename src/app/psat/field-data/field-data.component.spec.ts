/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { FieldDataComponent } from './field-data.component';

describe('FieldDataComponent', () => {
  let component: FieldDataComponent;
  let fixture: ComponentFixture<FieldDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FieldDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
