/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { OperatingHoursComponent } from './operating-hours.component';

describe('OperatingHoursComponent', () => {
  let component: OperatingHoursComponent;
  let fixture: ComponentFixture<OperatingHoursComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OperatingHoursComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperatingHoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
