import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseInfoDetailsComponent } from './purchase-info-details.component';

describe('PurchaseInfoDetailsComponent', () => {
  let component: PurchaseInfoDetailsComponent;
  let fixture: ComponentFixture<PurchaseInfoDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseInfoDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseInfoDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
