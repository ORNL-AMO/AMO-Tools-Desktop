import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CentrifugalSpecificsCatalogComponent } from './centrifugal-specifics-catalog.component';

describe('CentrifugalSpecificsCatalogComponent', () => {
  let component: CentrifugalSpecificsCatalogComponent;
  let fixture: ComponentFixture<CentrifugalSpecificsCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CentrifugalSpecificsCatalogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CentrifugalSpecificsCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
