import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorInventorySetupComponent } from './motor-inventory-setup.component';

describe('MotorInventorySetupComponent', () => {
  let component: MotorInventorySetupComponent;
  let fixture: ComponentFixture<MotorInventorySetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MotorInventorySetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MotorInventorySetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
