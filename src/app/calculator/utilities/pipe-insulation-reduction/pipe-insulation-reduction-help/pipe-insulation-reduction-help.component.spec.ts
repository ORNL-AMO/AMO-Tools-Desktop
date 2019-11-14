import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PipeInsulationReductionHelpComponent } from './pipe-insulation-reduction-help.component';

describe('PipeInsulationReductionHelpComponent', () => {
  let component: PipeInsulationReductionHelpComponent;
  let fixture: ComponentFixture<PipeInsulationReductionHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PipeInsulationReductionHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PipeInsulationReductionHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
