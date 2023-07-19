import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemCatalogComponent } from './system-catalog.component';

describe('SystemCatalogComponent', () => {
  let component: SystemCatalogComponent;
  let fixture: ComponentFixture<SystemCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SystemCatalogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
