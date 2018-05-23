import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorDriveComponent } from './motor-drive.component';

describe('MotorDriveComponent', () => {
  let component: MotorDriveComponent;
  let fixture: ComponentFixture<MotorDriveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MotorDriveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MotorDriveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
