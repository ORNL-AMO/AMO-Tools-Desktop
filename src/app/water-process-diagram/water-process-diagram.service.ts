import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { Settings } from '../shared/models/settings';
import { ParentContainerDimensions, WaterDiagram } from '../../process-flow-types/shared-process-flow-types';
import * as _ from 'lodash';
import { DiagramIdbService } from '../indexedDb/diagram-idb.service';
import { Diagram } from '../shared/models/app';

@Injectable({
  providedIn: 'root'
})
export class WaterProcessDiagramService {
  mainTab: BehaviorSubject<string>;
  diagram: BehaviorSubject<Diagram>;
  waterDiagram: BehaviorSubject<WaterDiagram>;
  parentContainer: BehaviorSubject<ParentContainerDimensions>;
  modalOpen: BehaviorSubject<boolean>;
  settings: BehaviorSubject<Settings>;

  constructor(private diagramidbService: DiagramIdbService) { 
    this.mainTab = new BehaviorSubject<string>('diagram');
    this.parentContainer = new BehaviorSubject<ParentContainerDimensions>(undefined);
    this.diagram = new BehaviorSubject<Diagram>(undefined);
    this.waterDiagram = new BehaviorSubject<WaterDiagram>(undefined);
    this.modalOpen = new BehaviorSubject<boolean>(false);
    this.settings = new BehaviorSubject<Settings>(undefined);
  }

  updateWaterDiagram(waterDiagram: WaterDiagram) {
    this.waterDiagram.next(waterDiagram);
  }

  getDefaultWaterDiagram(settings: Settings): WaterDiagram {
    return {
      isValid: true,
      flowDiagramData: {
        nodes: [],
        edges: []
      }
    }
  }
  
}
