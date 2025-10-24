import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformancePointsCatalogComponent } from './performance-points-catalog.component';

describe('PerformancePointsCatalogComponent', () => {
  let component: PerformancePointsCatalogComponent;
  let fixture: ComponentFixture<PerformancePointsCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerformancePointsCatalogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerformancePointsCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
