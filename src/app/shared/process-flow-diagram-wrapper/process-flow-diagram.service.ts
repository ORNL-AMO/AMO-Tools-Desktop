import { Injectable } from '@angular/core';
import { WaterProcess } from '../../water-process-diagram/water-process-diagram.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProcessFlowDiagramService {
  processFlowDiagramData: BehaviorSubject<ProcessFlowDiagramState>;
  processFlowParentData: BehaviorSubject<ProcessFlowParentData>;
  constructor() { 
    this.processFlowDiagramData = new BehaviorSubject<ProcessFlowDiagramState>(undefined)
    this.processFlowParentData = new BehaviorSubject<ProcessFlowParentData>(undefined)
  }
}

// todo 6783 move interfaces to a shared lib/ in wc mfe
export interface ProcessFlowDiagramState {
  context: string;
  parentHeight: number;
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