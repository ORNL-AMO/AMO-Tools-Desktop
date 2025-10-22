import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirMotorCatalogComponent } from './compressed-air-motor-catalog.component';

describe('CompressedAirMotorCatalogComponent', () => {
  let component: CompressedAirMotorCatalogComponent;
  let fixture: ComponentFixture<CompressedAirMotorCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompressedAirMotorCatalogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompressedAirMotorCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
