import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyUseFormComponent } from './energy-use-form.component';

describe('EnergyUseFormComponent', () => {
  let component: EnergyUseFormComponent;
  let fixture: ComponentFixture<EnergyUseFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnergyUseFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergyUseFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
