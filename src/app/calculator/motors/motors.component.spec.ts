import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorsComponent } from './motors.component';

describe('MotorsComponent', () => {
  let component: MotorsComponent;
  let fixture: ComponentFixture<MotorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MotorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MotorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
