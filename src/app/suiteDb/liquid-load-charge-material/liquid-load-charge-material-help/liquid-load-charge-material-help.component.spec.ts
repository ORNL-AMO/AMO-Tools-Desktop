import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LiquidLoadChargeMaterialHelpComponent } from './liquid-load-charge-material-help.component';

describe('LiquidLoadChargeMaterialHelpComponent', () => {
  let component: LiquidLoadChargeMaterialHelpComponent;
  let fixture: ComponentFixture<LiquidLoadChargeMaterialHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiquidLoadChargeMaterialHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiquidLoadChargeMaterialHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
