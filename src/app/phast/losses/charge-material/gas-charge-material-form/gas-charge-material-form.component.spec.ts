import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GasChargeMaterialFormComponent } from './gas-charge-material-form.component';

describe('GasChargeMaterialFormComponent', () => {
  let component: GasChargeMaterialFormComponent;
  let fixture: ComponentFixture<GasChargeMaterialFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GasChargeMaterialFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GasChargeMaterialFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
