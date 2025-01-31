import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlowoffCatalogComponent } from './blowoff-catalog.component';

describe('BlowoffCatalogComponent', () => {
  let component: BlowoffCatalogComponent;
  let fixture: ComponentFixture<BlowoffCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlowoffCatalogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlowoffCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
