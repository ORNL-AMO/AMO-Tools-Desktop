import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorInventoryComponent } from './motor-inventory.component';

describe('MotorInventoryComponent', () => {
  let component: MotorInventoryComponent;
  let fixture: ComponentFixture<MotorInventoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MotorInventoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MotorInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
