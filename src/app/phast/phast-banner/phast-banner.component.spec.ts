/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PhastBannerComponent } from './phast-banner.component';

describe('PhastBannerComponent', () => {
  let component: PhastBannerComponent;
  let fixture: ComponentFixture<PhastBannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhastBannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhastBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
