import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirCooledComponent } from './air-cooled.component';

describe('AirCooledComponent', () => {
  let component: AirCooledComponent;
  let fixture: ComponentFixture<AirCooledComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AirCooledComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirCooledComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
