/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PumpFluidComponent } from './pump-fluid.component';

describe('PumpFluidComponent', () => {
  let component: PumpFluidComponent;
  let fixture: ComponentFixture<PumpFluidComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PumpFluidComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PumpFluidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
