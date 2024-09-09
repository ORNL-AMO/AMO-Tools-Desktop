import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddedEnergyComponent } from './added-energy.component';

describe('AddedEnergyComponent', () => {
  let component: AddedEnergyComponent;
  let fixture: ComponentFixture<AddedEnergyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddedEnergyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddedEnergyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
