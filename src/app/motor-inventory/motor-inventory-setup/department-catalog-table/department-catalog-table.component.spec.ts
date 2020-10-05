import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentCatalogTableComponent } from './department-catalog-table.component';

describe('DepartmentCatalogTableComponent', () => {
  let component: DepartmentCatalogTableComponent;
  let fixture: ComponentFixture<DepartmentCatalogTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DepartmentCatalogTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DepartmentCatalogTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
