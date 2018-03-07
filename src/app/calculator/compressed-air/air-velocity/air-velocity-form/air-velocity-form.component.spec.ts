import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AirVelocityFormComponent } from './air-velocity-form.component';

describe('AirVelocityFormComponent', () => {
  let component: AirVelocityFormComponent;
  let fixture: ComponentFixture<AirVelocityFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AirVelocityFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AirVelocityFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
