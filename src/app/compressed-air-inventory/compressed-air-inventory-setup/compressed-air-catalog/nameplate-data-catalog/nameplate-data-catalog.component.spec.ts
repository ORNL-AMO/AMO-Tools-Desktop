import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NameplateDataCatalogComponent } from './nameplate-data-catalog.component';

describe('NameplateDataCatalogComponent', () => {
  let component: NameplateDataCatalogComponent;
  let fixture: ComponentFixture<NameplateDataCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NameplateDataCatalogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NameplateDataCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
