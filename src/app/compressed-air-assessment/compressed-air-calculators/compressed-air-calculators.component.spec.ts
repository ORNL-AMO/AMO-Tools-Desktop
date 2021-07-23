import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirCalculatorsComponent } from './compressed-air-calculators.component';

describe('CompressedAirCalculatorsComponent', () => {
  let component: CompressedAirCalculatorsComponent;
  let fixture: ComponentFixture<CompressedAirCalculatorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompressedAirCalculatorsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompressedAirCalculatorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
