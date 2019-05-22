import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirReductionComponent } from './compressed-air-reduction.component';

describe('CompressedAirReductionComponent', () => {
  let component: CompressedAirReductionComponent;
  let fixture: ComponentFixture<CompressedAirReductionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompressedAirReductionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompressedAirReductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
