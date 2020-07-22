import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseInformationPropertiesComponent } from './purchase-information-properties.component';

describe('PurchaseInformationPropertiesComponent', () => {
  let component: PurchaseInformationPropertiesComponent;
  let fixture: ComponentFixture<PurchaseInformationPropertiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseInformationPropertiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseInformationPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
