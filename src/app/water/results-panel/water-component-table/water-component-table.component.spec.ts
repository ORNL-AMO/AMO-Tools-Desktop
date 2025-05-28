import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterComponentTableComponent } from './water-component-table.component';

describe('WaterComponentTableComponent', () => {
  let component: WaterComponentTableComponent;
  let fixture: ComponentFixture<WaterComponentTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaterComponentTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WaterComponentTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
