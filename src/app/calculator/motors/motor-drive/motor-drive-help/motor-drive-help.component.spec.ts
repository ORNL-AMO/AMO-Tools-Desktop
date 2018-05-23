import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorDriveHelpComponent } from './motor-drive-help.component';

describe('MotorDriveHelpComponent', () => {
  let component: MotorDriveHelpComponent;
  let fixture: ComponentFixture<MotorDriveHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MotorDriveHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MotorDriveHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
