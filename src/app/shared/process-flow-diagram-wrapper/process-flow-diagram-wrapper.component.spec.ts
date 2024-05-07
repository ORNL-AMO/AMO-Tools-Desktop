import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessFlowDiagramWrapperComponent } from './process-flow-diagram-wrapper.component';

describe('ProcessFlowDiagramWrapperComponent', () => {
  let component: ProcessFlowDiagramWrapperComponent;
  let fixture: ComponentFixture<ProcessFlowDiagramWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcessFlowDiagramWrapperComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProcessFlowDiagramWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
