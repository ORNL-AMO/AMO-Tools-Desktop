import { Injectable } from '@angular/core';
import { WaterProcess } from '../../water-process-diagram/water-process-diagram.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProcessFlowDiagramService {
  processFlowDiagramData: BehaviorSubject<ProcessFlowDiagramState>;
  processFlowParentData: BehaviorSubject<ProcessFlowParentData>;
  parentContainer: BehaviorSubject<ParentContainerDimensions>;

  constructor() { 
    this.processFlowDiagramData = new BehaviorSubject<ProcessFlowDiagramState>(undefined);
    this.processFlowParentData = new BehaviorSubject<ProcessFlowParentData>(undefined);
    this.parentContainer = new BehaviorSubject<ParentContainerDimensions>(undefined);
  }
}

// todo 6783 move interfaces to a shared lib/ in wc mfe
export interface ProcessFlowDiagramState {
  context: string;
  parentContainer: {
    height: number,
    headerHeight: number;
    footerHeight: number;
  };
  waterProcess?: WaterProcess;
}

export interface ProcessFlowParentData {
  context: string;
  waterProcess?: WaterProcess;
}

export interface ProcessFlowDiagramEventDetail {
  processFlowParentData: {
    test: boolean, name: string
  }
}

export interface ParentContainerDimensions {
  height: number,
  headerHeight: number;
  footerHeight: number;
}