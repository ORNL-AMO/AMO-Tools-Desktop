/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { WaterCoolingLossesComponent } from './water-cooling-losses.component';

describe('WaterCoolingLossesComponent', () => {
  let component: WaterCoolingLossesComponent;
  let fixture: ComponentFixture<WaterCoolingLossesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WaterCoolingLossesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WaterCoolingLossesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
