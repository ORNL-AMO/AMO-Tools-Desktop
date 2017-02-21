/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { FlueGasLossesComponent } from './flue-gas-losses.component';

describe('FlueGasLossesComponent', () => {
  let component: FlueGasLossesComponent;
  let fixture: ComponentFixture<FlueGasLossesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlueGasLossesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlueGasLossesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
