import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AirVelocityHelpComponent } from './air-velocity-help.component';

describe('AirVelocityHelpComponent', () => {
  let component: AirVelocityHelpComponent;
  let fixture: ComponentFixture<AirVelocityHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AirVelocityHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AirVelocityHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
