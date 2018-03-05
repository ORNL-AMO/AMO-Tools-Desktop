import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AirVelocityComponent } from './air-velocity.component';

describe('AirVelocityComponent', () => {
  let component: AirVelocityComponent;
  let fixture: ComponentFixture<AirVelocityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AirVelocityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AirVelocityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
