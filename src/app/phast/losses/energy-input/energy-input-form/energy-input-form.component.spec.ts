import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyInputFormComponent } from './energy-input-form.component';

describe('EnergyInputFormComponent', () => {
  let component: EnergyInputFormComponent;
  let fixture: ComponentFixture<EnergyInputFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnergyInputFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergyInputFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
