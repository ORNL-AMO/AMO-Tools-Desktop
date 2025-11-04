import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirMotorPropertiesComponent } from './compressed-air-motor-properties.component';

describe('CompressedAirMotorPropertiesComponent', () => {
  let component: CompressedAirMotorPropertiesComponent;
  let fixture: ComponentFixture<CompressedAirMotorPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompressedAirMotorPropertiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompressedAirMotorPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
