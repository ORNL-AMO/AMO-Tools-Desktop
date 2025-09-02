import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValveEnergyLossHelpComponent } from './valve-energy-loss-help.component';

describe('ValveEnergyLossHelpComponent', () => {
  let component: ValveEnergyLossHelpComponent;
  let fixture: ComponentFixture<ValveEnergyLossHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValveEnergyLossHelpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValveEnergyLossHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
