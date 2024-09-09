import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorEnergyComponent } from './motor-energy.component';

describe('MotorEnergyComponent', () => {
  let component: MotorEnergyComponent;
  let fixture: ComponentFixture<MotorEnergyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MotorEnergyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MotorEnergyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
