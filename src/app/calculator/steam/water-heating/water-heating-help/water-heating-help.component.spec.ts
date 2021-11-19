import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterHeatingHelpComponent } from './water-heating-help.component';

describe('WaterHeatingHelpComponent', () => {
  let component: WaterHeatingHelpComponent;
  let fixture: ComponentFixture<WaterHeatingHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WaterHeatingHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WaterHeatingHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
