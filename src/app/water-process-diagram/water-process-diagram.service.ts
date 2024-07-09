import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Settings } from '../shared/models/settings';
import * as _ from 'lodash';
import { ParentContainerDimensions, WaterDiagram, } from '../../process-flow-types/shared-process-flow-types';
import { Assessment } from '../shared/models/assessment';
import { DischargeOutlet, IntakeSource, WaterUsingSystem, WaterProcessComponent } from '../shared/models/water-assessment';
import { Node } from 'reactflow';
import { Diagram } from '../shared/models/diagram';

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
        edges: []
      }
    }
  }

  setNewWaterAssessmentFromDiagram(waterDiagram: WaterDiagram, assessment: Assessment, newSettings: Settings) {
    let intakeSources = [];
    let waterUsingSystems = [];
    let dischargeOutlets = [];

    waterDiagram.flowDiagramData.nodes.forEach((waterDiagramNode: Node) => {
      const waterProcessComponent = waterDiagramNode.data as WaterProcessComponent;
      if (waterProcessComponent.processComponentType === 'water-intake') {
        const intakeSource = waterProcessComponent as IntakeSource;
        intakeSources.push(intakeSource);
      }
      if (waterProcessComponent.processComponentType === 'water-using-system') {
        waterUsingSystems.push(waterProcessComponent as WaterUsingSystem)
      }
      if (waterProcessComponent.processComponentType === 'water-discharge') {
        dischargeOutlets.push(waterProcessComponent as DischargeOutlet);
      }
    })
    assessment.water.intakeSources = intakeSources;
    assessment.water.waterUsingSystems = waterUsingSystems;
    assessment.water.dischargeOutlets = dischargeOutlets;
  }
}
