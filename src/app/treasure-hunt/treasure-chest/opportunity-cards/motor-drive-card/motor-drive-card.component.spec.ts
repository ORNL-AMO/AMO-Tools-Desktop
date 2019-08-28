import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorDriveCardComponent } from './motor-drive-card.component';

describe('MotorDriveCardComponent', () => {
  let component: MotorDriveCardComponent;
  let fixture: ComponentFixture<MotorDriveCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MotorDriveCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MotorDriveCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
