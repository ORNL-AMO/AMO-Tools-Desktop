import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PumpMotorCatalogComponent } from './pump-motor-catalog.component';

describe('PumpMotorCatalogComponent', () => {
  let component: PumpMotorCatalogComponent;
  let fixture: ComponentFixture<PumpMotorCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PumpMotorCatalogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PumpMotorCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
