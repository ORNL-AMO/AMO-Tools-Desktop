import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PumpStatusCatalogComponent } from './pump-status-catalog.component';

describe('PumpStatusCatalogComponent', () => {
  let component: PumpStatusCatalogComponent;
  let fixture: ComponentFixture<PumpStatusCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PumpStatusCatalogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PumpStatusCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
