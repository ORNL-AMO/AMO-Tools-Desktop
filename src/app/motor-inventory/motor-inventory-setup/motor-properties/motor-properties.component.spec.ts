import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorPropertiesComponent } from './motor-properties.component';

describe('MotorPropertiesComponent', () => {
  let component: MotorPropertiesComponent;
  let fixture: ComponentFixture<MotorPropertiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MotorPropertiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MotorPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
