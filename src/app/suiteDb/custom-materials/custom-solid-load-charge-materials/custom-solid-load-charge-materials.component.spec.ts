import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomSolidLoadChargeMaterialsComponent } from './custom-solid-load-charge-materials.component';

describe('CustomSolidLoadChargeMaterialsComponent', () => {
  let component: CustomSolidLoadChargeMaterialsComponent;
  let fixture: ComponentFixture<CustomSolidLoadChargeMaterialsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomSolidLoadChargeMaterialsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomSolidLoadChargeMaterialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
