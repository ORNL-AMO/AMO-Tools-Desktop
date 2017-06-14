import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyInputHelpComponent } from './energy-input-help.component';

describe('EnergyInputHelpComponent', () => {
  let component: EnergyInputHelpComponent;
  let fixture: ComponentFixture<EnergyInputHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnergyInputHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergyInputHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
