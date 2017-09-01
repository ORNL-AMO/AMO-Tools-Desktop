import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyInputComponent } from './energy-input.component';

describe('EnergyInputComponent', () => {
  let component: EnergyInputComponent;
  let fixture: ComponentFixture<EnergyInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnergyInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergyInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
