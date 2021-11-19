import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NutrientRemovalTableComponent } from './nutrient-removal-table.component';

describe('NutrientRemovalTableComponent', () => {
  let component: NutrientRemovalTableComponent;
  let fixture: ComponentFixture<NutrientRemovalTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NutrientRemovalTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NutrientRemovalTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
