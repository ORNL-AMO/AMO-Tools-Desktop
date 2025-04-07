import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Settings } from '../shared/models/settings';
import * as _ from 'lodash';
import { Diagram } from '../shared/models/diagram';
import { ParentContainerDimensions, WaterDiagram } from 'process-flow-lib';

@Injectable()
export class WaterProcessDiagramService {
  mainTab: BehaviorSubject<string>;
  diagram: BehaviorSubject<Diagram>;
  waterDiagram: BehaviorSubject<WaterDiagram>;
  parentContainer: BehaviorSubject<ParentContainerDimensions>;
  modalOpen: BehaviorSubject<boolean>;
  settings: BehaviorSubject<Settings>;

  constructor() { 
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
        edges: [],
        nodeErrors: {},
        userDiagramOptions: undefined,
        settings: {
          flowDecimalPrecision: settings.flowDecimalPrecision,
          unitsOfMeasure: settings.unitsOfMeasure,
          conductivityUnit: 'mmho',
        },
        calculatedData: {nodes: {}},
        recentNodeColors: [],
        recentEdgeColors: []
      },
    }
  }

}
