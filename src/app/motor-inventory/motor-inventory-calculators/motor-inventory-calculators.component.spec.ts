import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorInventoryCalculatorsComponent } from './motor-inventory-calculators.component';

describe('MotorInventoryCalculatorsComponent', () => {
  let component: MotorInventoryCalculatorsComponent;
  let fixture: ComponentFixture<MotorInventoryCalculatorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MotorInventoryCalculatorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MotorInventoryCalculatorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
