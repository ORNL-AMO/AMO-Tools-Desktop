import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirSummaryComponent } from './compressed-air-summary.component';

describe('CompressedAirSummaryComponent', () => {
  let component: CompressedAirSummaryComponent;
  let fixture: ComponentFixture<CompressedAirSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompressedAirSummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompressedAirSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
