import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeatEnergyComponent } from './heat-energy.component';

describe('HeatEnergyComponent', () => {
  let component: HeatEnergyComponent;
  let fixture: ComponentFixture<HeatEnergyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeatEnergyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HeatEnergyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
