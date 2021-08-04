import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiquidCoolingFormComponent } from './liquid-cooling-form.component';

describe('LiquidCoolingFormComponent', () => {
  let component: LiquidCoolingFormComponent;
  let fixture: ComponentFixture<LiquidCoolingFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LiquidCoolingFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LiquidCoolingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
