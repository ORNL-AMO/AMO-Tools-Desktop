import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorDriveGraphComponent } from './motor-drive-graph.component';

describe('MotorDriveGraphComponent', () => {
  let component: MotorDriveGraphComponent;
  let fixture: ComponentFixture<MotorDriveGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MotorDriveGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MotorDriveGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
