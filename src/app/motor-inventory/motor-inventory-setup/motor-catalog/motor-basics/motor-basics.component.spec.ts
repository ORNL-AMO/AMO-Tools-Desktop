import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorBasicsComponent } from './motor-basics.component';

describe('MotorBasicsComponent', () => {
  let component: MotorBasicsComponent;
  let fixture: ComponentFixture<MotorBasicsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MotorBasicsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MotorBasicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
