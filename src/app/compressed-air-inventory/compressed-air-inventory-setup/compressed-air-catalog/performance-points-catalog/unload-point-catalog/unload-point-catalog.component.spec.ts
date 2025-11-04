import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnloadPointCatalogComponent } from './unload-point-catalog.component';

describe('UnloadPointCatalogComponent', () => {
  let component: UnloadPointCatalogComponent;
  let fixture: ComponentFixture<UnloadPointCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnloadPointCatalogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnloadPointCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
