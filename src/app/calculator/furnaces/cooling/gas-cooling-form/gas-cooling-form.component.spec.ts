import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GasCoolingFormComponent } from './gas-cooling-form.component';

describe('GasCoolingFormComponent', () => {
  let component: GasCoolingFormComponent;
  let fixture: ComponentFixture<GasCoolingFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GasCoolingFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GasCoolingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
