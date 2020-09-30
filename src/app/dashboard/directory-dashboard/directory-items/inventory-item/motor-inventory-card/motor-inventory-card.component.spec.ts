import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorInventoryCardComponent } from './motor-inventory-card.component';

describe('MotorInventoryCardComponent', () => {
  let component: MotorInventoryCardComponent;
  let fixture: ComponentFixture<MotorInventoryCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MotorInventoryCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MotorInventoryCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
