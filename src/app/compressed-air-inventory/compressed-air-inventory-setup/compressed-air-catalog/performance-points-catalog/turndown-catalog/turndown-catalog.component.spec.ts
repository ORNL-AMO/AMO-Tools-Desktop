import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TurndownCatalogComponent } from './turndown-catalog.component';

describe('TurndownCatalogComponent', () => {
  let component: TurndownCatalogComponent;
  let fixture: ComponentFixture<TurndownCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TurndownCatalogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TurndownCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
