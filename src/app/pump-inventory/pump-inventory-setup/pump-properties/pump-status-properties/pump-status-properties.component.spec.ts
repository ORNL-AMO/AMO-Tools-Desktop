import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PumpStatusPropertiesComponent } from './pump-status-properties.component';

describe('PumpStatusPropertiesComponent', () => {
  let component: PumpStatusPropertiesComponent;
  let fixture: ComponentFixture<PumpStatusPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PumpStatusPropertiesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PumpStatusPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
