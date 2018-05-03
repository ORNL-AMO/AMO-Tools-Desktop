import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomGasLoadChargeMaterialsComponent } from './custom-gas-load-charge-materials.component';

describe('CustomGasLoadChargeMaterialsComponent', () => {
  let component: CustomGasLoadChargeMaterialsComponent;
  let fixture: ComponentFixture<CustomGasLoadChargeMaterialsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomGasLoadChargeMaterialsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomGasLoadChargeMaterialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
