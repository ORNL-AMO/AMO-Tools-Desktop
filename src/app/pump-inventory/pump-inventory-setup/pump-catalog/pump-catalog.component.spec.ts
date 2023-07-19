import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PumpCatalogComponent } from './pump-catalog.component';

describe('PumpCatalogComponent', () => {
  let component: PumpCatalogComponent;
  let fixture: ComponentFixture<PumpCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PumpCatalogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PumpCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
