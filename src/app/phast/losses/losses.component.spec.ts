/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { LossesComponent } from './losses.component';

describe('LossesComponent', () => {
  let component: LossesComponent;
  let fixture: ComponentFixture<LossesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LossesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LossesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
