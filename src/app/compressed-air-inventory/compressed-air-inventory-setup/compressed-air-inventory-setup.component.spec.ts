import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirInventorySetupComponent } from './compressed-air-inventory-setup.component';

describe('CompressedAirInventorySetupComponent', () => {
  let component: CompressedAirInventorySetupComponent;
  let fixture: ComponentFixture<CompressedAirInventorySetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompressedAirInventorySetupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CompressedAirInventorySetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
