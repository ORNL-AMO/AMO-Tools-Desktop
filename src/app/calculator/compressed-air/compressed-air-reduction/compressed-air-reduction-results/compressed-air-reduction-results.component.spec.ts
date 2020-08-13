import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirReductionResultsComponent } from './compressed-air-reduction-results.component';

describe('CompressedAirReductionResultsComponent', () => {
  let component: CompressedAirReductionResultsComponent;
  let fixture: ComponentFixture<CompressedAirReductionResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompressedAirReductionResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompressedAirReductionResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
