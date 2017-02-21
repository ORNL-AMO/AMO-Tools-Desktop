/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { WallLossesComponent } from './wall-losses.component';

describe('WallLossesComponent', () => {
  let component: WallLossesComponent;
  let fixture: ComponentFixture<WallLossesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WallLossesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WallLossesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
