import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PumpMotorPropertiesComponent } from './pump-motor-properties.component';

describe('PumpMotorPropertiesComponent', () => {
  let component: PumpMotorPropertiesComponent;
  let fixture: ComponentFixture<PumpMotorPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PumpMotorPropertiesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PumpMotorPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
