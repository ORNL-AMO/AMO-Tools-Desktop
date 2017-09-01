/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { OtherLossesComponent } from './other-losses.component';

describe('OtherLossesComponent', () => {
  let component: OtherLossesComponent;
  let fixture: ComponentFixture<OtherLossesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OtherLossesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherLossesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
