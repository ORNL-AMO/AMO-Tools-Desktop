import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GasLoadChargeMaterialHelpComponent } from './gas-load-charge-material-help.component';

describe('GasLoadChargeMaterialHelpComponent', () => {
  let component: GasLoadChargeMaterialHelpComponent;
  let fixture: ComponentFixture<GasLoadChargeMaterialHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GasLoadChargeMaterialHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GasLoadChargeMaterialHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
