import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirRollupComponent } from './compressed-air-rollup.component';

describe('CompressedAirRollupComponent', () => {
  let component: CompressedAirRollupComponent;
  let fixture: ComponentFixture<CompressedAirRollupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompressedAirRollupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompressedAirRollupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
