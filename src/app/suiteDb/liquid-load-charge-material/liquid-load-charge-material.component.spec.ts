import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LiquidLoadChargeMaterialComponent } from './liquid-load-charge-material.component';

describe('LiquidLoadChargeMaterialComponent', () => {
  let component: LiquidLoadChargeMaterialComponent;
  let fixture: ComponentFixture<LiquidLoadChargeMaterialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiquidLoadChargeMaterialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiquidLoadChargeMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
