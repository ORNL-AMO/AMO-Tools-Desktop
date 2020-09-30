import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InventorySummaryMotorDetailsComponent } from './inventory-summary-motor-details.component';

describe('InventorySummaryMotorDetailsComponent', () => {
  let component: InventorySummaryMotorDetailsComponent;
  let fixture: ComponentFixture<InventorySummaryMotorDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventorySummaryMotorDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventorySummaryMotorDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
