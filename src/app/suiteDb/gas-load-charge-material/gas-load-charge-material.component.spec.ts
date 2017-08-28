import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GasLoadChargeMaterialComponent } from './gas-load-charge-material.component';

describe('GasLoadChargeMaterialComponent', () => {
  let component: GasLoadChargeMaterialComponent;
  let fixture: ComponentFixture<GasLoadChargeMaterialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GasLoadChargeMaterialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GasLoadChargeMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
