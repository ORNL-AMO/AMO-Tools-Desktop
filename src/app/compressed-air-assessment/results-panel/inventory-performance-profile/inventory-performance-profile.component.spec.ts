import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryPerformanceProfileComponent } from './inventory-performance-profile.component';

describe('InventoryPerformanceProfileComponent', () => {
  let component: InventoryPerformanceProfileComponent;
  let fixture: ComponentFixture<InventoryPerformanceProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InventoryPerformanceProfileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryPerformanceProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
