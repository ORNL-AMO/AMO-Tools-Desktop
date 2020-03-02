import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PipeInsulationReductionFormComponent } from './pipe-insulation-reduction-form.component';

describe('PipeInsulationReductionFormComponent', () => {
  let component: PipeInsulationReductionFormComponent;
  let fixture: ComponentFixture<PipeInsulationReductionFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PipeInsulationReductionFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PipeInsulationReductionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
