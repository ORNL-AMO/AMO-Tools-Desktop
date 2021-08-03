import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryHelpComponent } from './inventory-help.component';

describe('InventoryHelpComponent', () => {
  let component: InventoryHelpComponent;
  let fixture: ComponentFixture<InventoryHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InventoryHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
