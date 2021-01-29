import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseInformationDataComponent } from './purchase-information-data.component';

describe('PurchaseInformationDataComponent', () => {
  let component: PurchaseInformationDataComponent;
  let fixture: ComponentFixture<PurchaseInformationDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseInformationDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseInformationDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
