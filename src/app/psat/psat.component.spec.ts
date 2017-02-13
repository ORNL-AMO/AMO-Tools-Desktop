/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PsatComponent } from './psat.component';

describe('PsatComponent', () => {
  let component: PsatComponent;
  let fixture: ComponentFixture<PsatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PsatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PsatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
