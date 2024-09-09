import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterSystemDataModalComponent } from './water-system-data-modal.component';

describe('WaterSystemDataModalComponent', () => {
  let component: WaterSystemDataModalComponent;
  let fixture: ComponentFixture<WaterSystemDataModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaterSystemDataModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WaterSystemDataModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
