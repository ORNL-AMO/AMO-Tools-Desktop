import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Settings } from '../shared/models/settings';
import * as _ from 'lodash';
import { Diagram } from '../shared/models/diagram';
import { getDefaultUserDiagramOptions, ParentContainerDimensions, WaterDiagram } from 'process-flow-lib';

@Injectable()
export class WaterProcessDiagramService {
  mainTab: BehaviorSubject<string>;
  diagram: BehaviorSubject<Diagram>;
  waterDiagram: BehaviorSubject<WaterDiagram>;
  // * the web component mounts only once this is measured, and it must be measured while the container is visible.
  // * This service outlives the diagram component, so the owner must reset it to undefined on destroy
  parentContainer: BehaviorSubject<ParentContainerDimensions>;
  modalOpen: BehaviorSubject<boolean>;
  settings: BehaviorSubject<Settings>;
  // * bumped to make the diagram web component re-mount and re-hydrate from the current waterDiagram
  diagramRemount: BehaviorSubject<number>;

  constructor() { 
    this.mainTab = new BehaviorSubject<string>('diagram');
    this.parentContainer = new BehaviorSubject<ParentContainerDimensions>(undefined);
    this.diagram = new BehaviorSubject<Diagram>(undefined);
    this.waterDiagram = new BehaviorSubject<WaterDiagram>(undefined);
    this.modalOpen = new BehaviorSubject<boolean>(false);
    this.settings = new BehaviorSubject<Settings>(undefined);
    this.diagramRemount = new BehaviorSubject<number>(0);
  }

  updateWaterDiagram(waterDiagram: WaterDiagram) {
    this.waterDiagram.next(waterDiagram);
  }

  remountDiagram() {
    this.diagramRemount.next(this.diagramRemount.getValue() + 1);
  }

  // todo 6906 this mirrors DiagramState but does not need all props. Look at potential bugs
  getDefaultWaterDiagram(settings: Settings): WaterDiagram {
    return {
      isValid: true,
      flowDiagramData: {
        name: 'Water Process Diagram',
        nodes: [],
        edges: [],
        diagramFlowErrors: {},
        userDiagramOptions: getDefaultUserDiagramOptions(),
        settings: {
          electricityCost: settings.electricityCost,
          fuelCost: settings.fuelCost,
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
