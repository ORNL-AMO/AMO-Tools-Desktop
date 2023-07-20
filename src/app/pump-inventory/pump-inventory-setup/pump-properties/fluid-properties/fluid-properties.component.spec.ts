import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FluidPropertiesComponent } from './fluid-properties.component';

describe('FluidPropertiesComponent', () => {
  let component: FluidPropertiesComponent;
  let fixture: ComponentFixture<FluidPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FluidPropertiesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FluidPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
