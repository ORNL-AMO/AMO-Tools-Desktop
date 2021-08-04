import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterHeatingComponent } from './water-heating.component';

describe('WaterHeatingComponent', () => {
  let component: WaterHeatingComponent;
  let fixture: ComponentFixture<WaterHeatingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WaterHeatingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WaterHeatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
