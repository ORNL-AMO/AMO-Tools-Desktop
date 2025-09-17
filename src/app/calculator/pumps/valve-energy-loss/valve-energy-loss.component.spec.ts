import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValveEnergyLossComponent } from './valve-energy-loss.component';

describe('ValveEnergyLossComponent', () => {
  let component: ValveEnergyLossComponent;
  let fixture: ComponentFixture<ValveEnergyLossComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValveEnergyLossComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValveEnergyLossComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
