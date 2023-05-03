import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseInformationComponent } from './purchase-information.component';

describe('PurchaseInformationComponent', () => {
  let component: PurchaseInformationComponent;
  let fixture: ComponentFixture<PurchaseInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PurchaseInformationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
