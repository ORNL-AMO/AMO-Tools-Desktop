import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterSystemDataComponent } from './water-system-data.component';

describe('WaterSystemDataComponent', () => {
  let component: WaterSystemDataComponent;
  let fixture: ComponentFixture<WaterSystemDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaterSystemDataComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WaterSystemDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
