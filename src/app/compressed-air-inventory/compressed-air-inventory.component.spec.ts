import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirInventoryComponent } from './compressed-air-inventory.component';

describe('CompressedAirInventoryComponent', () => {
  let component: CompressedAirInventoryComponent;
  let fixture: ComponentFixture<CompressedAirInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompressedAirInventoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CompressedAirInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
