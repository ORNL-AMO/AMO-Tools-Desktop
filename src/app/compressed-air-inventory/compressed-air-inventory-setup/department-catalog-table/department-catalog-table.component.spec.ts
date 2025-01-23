import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentCatalogTableComponent } from './department-catalog-table.component';

describe('DepartmentCatalogTableComponent', () => {
  let component: DepartmentCatalogTableComponent;
  let fixture: ComponentFixture<DepartmentCatalogTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentCatalogTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartmentCatalogTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
