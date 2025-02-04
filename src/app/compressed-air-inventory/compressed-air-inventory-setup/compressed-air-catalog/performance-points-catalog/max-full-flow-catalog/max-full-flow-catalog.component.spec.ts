import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaxFullFlowCatalogComponent } from './max-full-flow-catalog.component';

describe('MaxFullFlowCatalogComponent', () => {
  let component: MaxFullFlowCatalogComponent;
  let fixture: ComponentFixture<MaxFullFlowCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaxFullFlowCatalogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaxFullFlowCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
