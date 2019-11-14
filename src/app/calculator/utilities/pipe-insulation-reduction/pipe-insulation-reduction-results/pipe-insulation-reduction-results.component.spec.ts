import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PipeInsulationReductionResultsComponent } from './pipe-insulation-reduction-results.component';

describe('PipeInsulationReductionResultsComponent', () => {
  let component: PipeInsulationReductionResultsComponent;
  let fixture: ComponentFixture<PipeInsulationReductionResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PipeInsulationReductionResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PipeInsulationReductionResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
