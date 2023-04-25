import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FluidCatalogComponent } from './fluid-catalog.component';

describe('FluidCatalogComponent', () => {
  let component: FluidCatalogComponent;
  let fixture: ComponentFixture<FluidCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FluidCatalogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FluidCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
