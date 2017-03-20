import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LiquidChargeMaterialFormComponent } from './liquid-charge-material-form.component';

describe('LiquidChargeMaterialFormComponent', () => {
  let component: LiquidChargeMaterialFormComponent;
  let fixture: ComponentFixture<LiquidChargeMaterialFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiquidChargeMaterialFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiquidChargeMaterialFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
