/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PhastComponent } from './phast.component';

describe('PhastComponent', () => {
  let component: PhastComponent;
  let fixture: ComponentFixture<PhastComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhastComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
