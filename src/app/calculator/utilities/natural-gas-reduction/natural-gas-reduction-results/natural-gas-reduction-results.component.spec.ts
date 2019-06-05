import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NaturalGasReductionResultsComponent } from './natural-gas-reduction-results.component';

describe('NaturalGasReductionResultsComponent', () => {
  let component: NaturalGasReductionResultsComponent;
  let fixture: ComponentFixture<NaturalGasReductionResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NaturalGasReductionResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NaturalGasReductionResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
