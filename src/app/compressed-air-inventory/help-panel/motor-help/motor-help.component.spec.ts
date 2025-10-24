import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorHelpComponent } from './motor-help.component';

describe('MotorHelpComponent', () => {
  let component: MotorHelpComponent;
  let fixture: ComponentFixture<MotorHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MotorHelpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MotorHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
