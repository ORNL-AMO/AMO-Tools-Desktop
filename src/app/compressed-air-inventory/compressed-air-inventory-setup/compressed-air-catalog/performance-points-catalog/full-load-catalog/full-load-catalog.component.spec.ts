import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullLoadCatalogComponent } from './full-load-catalog.component';

describe('FullLoadCatalogComponent', () => {
  let component: FullLoadCatalogComponent;
  let fixture: ComponentFixture<FullLoadCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FullLoadCatalogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FullLoadCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
