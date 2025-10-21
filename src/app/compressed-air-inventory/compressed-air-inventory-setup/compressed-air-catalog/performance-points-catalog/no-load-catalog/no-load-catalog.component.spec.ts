import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoLoadCatalogComponent } from './no-load-catalog.component';

describe('NoLoadCatalogComponent', () => {
  let component: NoLoadCatalogComponent;
  let fixture: ComponentFixture<NoLoadCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoLoadCatalogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoLoadCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
