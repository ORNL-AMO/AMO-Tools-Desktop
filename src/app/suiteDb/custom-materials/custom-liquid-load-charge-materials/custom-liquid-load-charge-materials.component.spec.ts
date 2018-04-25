import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomLiquidLoadChargeMaterialsComponent } from './custom-liquid-load-charge-materials.component';

describe('CustomLiquidLoadChargeMaterialsComponent', () => {
  let component: CustomLiquidLoadChargeMaterialsComponent;
  let fixture: ComponentFixture<CustomLiquidLoadChargeMaterialsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomLiquidLoadChargeMaterialsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomLiquidLoadChargeMaterialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
