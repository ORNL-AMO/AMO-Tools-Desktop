import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PumpPropertiesComponent } from './pump-properties.component';

describe('PumpPropertiesComponent', () => {
  let component: PumpPropertiesComponent;
  let fixture: ComponentFixture<PumpPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PumpPropertiesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PumpPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
