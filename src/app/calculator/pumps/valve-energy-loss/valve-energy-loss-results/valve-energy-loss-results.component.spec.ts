import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValveEnergyLossResultsComponent } from './valve-energy-loss-results.component';

describe('ValveEnergyLossResultsComponent', () => {
  let component: ValveEnergyLossResultsComponent;
  let fixture: ComponentFixture<ValveEnergyLossResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValveEnergyLossResultsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValveEnergyLossResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
