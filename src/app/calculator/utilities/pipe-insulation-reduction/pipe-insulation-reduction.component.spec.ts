import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PipeInsulationReductionComponent } from './pipe-insulation-reduction.component';

describe('PipeInsulationReductionComponent', () => {
  let component: PipeInsulationReductionComponent;
  let fixture: ComponentFixture<PipeInsulationReductionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PipeInsulationReductionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PipeInsulationReductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
