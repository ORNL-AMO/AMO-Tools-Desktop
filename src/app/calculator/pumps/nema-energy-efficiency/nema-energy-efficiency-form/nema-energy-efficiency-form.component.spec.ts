import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NemaEnergyEfficiencyFormComponent } from './nema-energy-efficiency-form.component';

describe('NemaEnergyEfficiencyFormComponent', () => {
  let component: NemaEnergyEfficiencyFormComponent;
  let fixture: ComponentFixture<NemaEnergyEfficiencyFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NemaEnergyEfficiencyFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NemaEnergyEfficiencyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
