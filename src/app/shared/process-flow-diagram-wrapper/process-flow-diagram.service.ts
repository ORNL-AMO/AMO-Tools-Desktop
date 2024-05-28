import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ParentContainerDimensions, ProcessFlowDiagramState, ProcessFlowParentState } from '../../../process-flow-types/process-flow-types';

@Injectable({
  providedIn: 'root'
})
export class ProcessFlowDiagramService {
  processFlowParentState: BehaviorSubject<ProcessFlowParentState>;
  processFlowDiagramState: BehaviorSubject<ProcessFlowDiagramState>;
  parentContainer: BehaviorSubject<ParentContainerDimensions>;

  constructor() { 
    this.processFlowParentState = new BehaviorSubject<ProcessFlowParentState>(undefined);
    this.processFlowDiagramState = new BehaviorSubject<ProcessFlowDiagramState>(undefined);
    this.parentContainer = new BehaviorSubject<ParentContainerDimensions>(undefined);
  }
}
