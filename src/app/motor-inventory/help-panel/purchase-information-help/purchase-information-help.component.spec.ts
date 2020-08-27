import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseInformationHelpComponent } from './purchase-information-help.component';

describe('PurchaseInformationHelpComponent', () => {
  let component: PurchaseInformationHelpComponent;
  let fixture: ComponentFixture<PurchaseInformationHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseInformationHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseInformationHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
