import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorDriveTableComponent } from './motor-drive-table.component';

describe('MotorDriveTableComponent', () => {
  let component: MotorDriveTableComponent;
  let fixture: ComponentFixture<MotorDriveTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MotorDriveTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MotorDriveTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
