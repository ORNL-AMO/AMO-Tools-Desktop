import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirPropertiesComponent } from './compressed-air-properties.component';

describe('CompressedAirPropertiesComponent', () => {
  let component: CompressedAirPropertiesComponent;
  let fixture: ComponentFixture<CompressedAirPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompressedAirPropertiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompressedAirPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
