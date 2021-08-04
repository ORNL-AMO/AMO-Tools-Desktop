import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargeMaterialComponent } from './charge-material.component';

describe('ChargeMaterialComponent', () => {
  let component: ChargeMaterialComponent;
  let fixture: ComponentFixture<ChargeMaterialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChargeMaterialComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargeMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
