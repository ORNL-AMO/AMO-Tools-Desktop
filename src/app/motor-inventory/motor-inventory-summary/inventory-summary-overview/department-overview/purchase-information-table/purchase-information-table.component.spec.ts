import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseInformationTableComponent } from './purchase-information-table.component';

describe('PurchaseInformationTableComponent', () => {
  let component: PurchaseInformationTableComponent;
  let fixture: ComponentFixture<PurchaseInformationTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseInformationTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseInformationTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
