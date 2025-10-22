import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignDetailsCatalogComponent } from './design-details-catalog.component';

describe('DesignDetailsCatalogComponent', () => {
  let component: DesignDetailsCatalogComponent;
  let fixture: ComponentFixture<DesignDetailsCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesignDetailsCatalogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DesignDetailsCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
