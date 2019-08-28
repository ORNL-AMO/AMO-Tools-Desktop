import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirReductionCardComponent } from './compressed-air-reduction-card.component';

describe('CompressedAirReductionCardComponent', () => {
  let component: CompressedAirReductionCardComponent;
  let fixture: ComponentFixture<CompressedAirReductionCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompressedAirReductionCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompressedAirReductionCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
