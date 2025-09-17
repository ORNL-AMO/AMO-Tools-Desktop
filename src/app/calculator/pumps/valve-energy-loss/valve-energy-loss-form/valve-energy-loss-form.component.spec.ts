import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValveEnergyLossFormComponent } from './valve-energy-loss-form.component';

describe('ValveEnergyLossFormComponent', () => {
  let component: ValveEnergyLossFormComponent;
  let fixture: ComponentFixture<ValveEnergyLossFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValveEnergyLossFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValveEnergyLossFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
