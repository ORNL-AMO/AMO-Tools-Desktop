import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemCatalogTableComponent } from './system-catalog-table.component';

describe('SystemCatalogTableComponent', () => {
  let component: SystemCatalogTableComponent;
  let fixture: ComponentFixture<SystemCatalogTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemCatalogTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemCatalogTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
