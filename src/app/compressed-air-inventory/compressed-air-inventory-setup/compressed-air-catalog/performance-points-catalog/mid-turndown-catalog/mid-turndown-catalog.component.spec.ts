import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MidTurndownCatalogComponent } from './mid-turndown-catalog.component';

describe('MidTurndownCatalogComponent', () => {
  let component: MidTurndownCatalogComponent;
  let fixture: ComponentFixture<MidTurndownCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MidTurndownCatalogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MidTurndownCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
