import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorDriveFormComponent } from './motor-drive-form.component';

describe('MotorDriveFormComponent', () => {
  let component: MotorDriveFormComponent;
  let fixture: ComponentFixture<MotorDriveFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MotorDriveFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MotorDriveFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
