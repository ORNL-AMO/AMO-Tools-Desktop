/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PsatTabsComponent } from './psat-tabs.component';

describe('PsatTabsComponent', () => {
  let component: PsatTabsComponent;
  let fixture: ComponentFixture<PsatTabsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PsatTabsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PsatTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
