import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SystemInformationFormService } from '../compressed-air-assessment/system-information/system-information-form.service';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { Settings } from '../shared/models/settings';
import { DischargeOutlet, IntakeSource, ProcessUse, WaterAssessment, WaterProcessComponent } from '../shared/models/water-assessment';
import { Assessment } from '../shared/models/assessment';
import { WaterDiagram } from '../../process-flow-types/shared-process-flow-types';
import { Node } from 'reactflow';
import { WaterProcessDiagramService } from '../water-process-diagram/water-process-diagram.service';
// import { getNewProcessComponent } from '../../../process-flow-diagram-component/src/components/Flow/process-flow-utils';
// todo 6875 measur compiler doesn't like pulling in this module because it's from jsx

@Injectable({
  providedIn: 'root'
})
export class WaterAssessmentService {

  settings: BehaviorSubject<Settings>;
  mainTab: BehaviorSubject<string>;
  setupTab: BehaviorSubject<WaterSetupTabString>;
  focusedField: BehaviorSubject<string>;
  helpTextField: BehaviorSubject<string>;
  calcTab: BehaviorSubject<string>;
  assessmentTab: BehaviorSubject<string>;
  secondaryAssessmentTab: BehaviorSubject<string>;
  modalOpen: BehaviorSubject<boolean>;
  waterAssessment: BehaviorSubject<WaterAssessment>;
  selectedModificationId: BehaviorSubject<string>;
  showModificationListModal: BehaviorSubject<boolean>;
  showAddModificationModal: BehaviorSubject<boolean>;
  showExportModal: BehaviorSubject<boolean>;
  setupTabs: Array<WaterSetupTabString> = [
    'system-basics',
  ];
  constructor(
    private systemInformationFormService: SystemInformationFormService,
    private waterProcessDiagramService: WaterProcessDiagramService, 
    private convertUnitsService: ConvertUnitsService) {
    this.settings = new BehaviorSubject<Settings>(undefined);
    this.mainTab = new BehaviorSubject<string>('system-setup');
    this.setupTab = new BehaviorSubject<WaterSetupTabString>('system-basics');
    this.focusedField = new BehaviorSubject<string>('default');
    this.helpTextField = new BehaviorSubject<string>('default');
    // this.calcTab = new BehaviorSubject<string>('air-flow-conversion');
    this.assessmentTab = new BehaviorSubject<string>('explore-opportunities');
    this.secondaryAssessmentTab = new BehaviorSubject<string>('modifications');
    this.waterAssessment = new BehaviorSubject<WaterAssessment>(undefined);
    this.modalOpen = new BehaviorSubject<boolean>(false);
    this.selectedModificationId = new BehaviorSubject<string>(undefined);
    this.showModificationListModal = new BehaviorSubject<boolean>(false);
    this.showAddModificationModal = new BehaviorSubject<boolean>(false);
    this.showExportModal = new BehaviorSubject<boolean>(false);
  }

  updateWaterAssessment(waterAssessment: WaterAssessment) {
    console.log('updateWaterAssessment', waterAssessment);
    // this.updateWaterDiagram(waterAssessment);
    this.waterAssessment.next(waterAssessment);
  }
  updateWaterDiagram(assessment: WaterAssessment) {
    // todo add waterProcessDiagramService method to get diagrams form assessment id
    let waterDiagram: WaterDiagram;
    // todo iterate over component types on assessment
    // todo each find id in nodes and map update
    // todo save method on waterProcessDiagramService
    // waterDiagram.flowDiagramData.nodes.map((waterDiagramNode: Node) => {})
  }

  setNewWaterAssessmentFromDiagram(waterDiagram: WaterDiagram, assessment: Assessment, newSettings: Settings) {
    let intakeSources = [];
    let processUses = [];
    let dischargeOutlets = [];

    waterDiagram.flowDiagramData.nodes.map((waterDiagramNode: Node) => {
      const waterProcessComponent = waterDiagramNode.data as WaterProcessComponent;
      if (waterProcessComponent.processComponentType === 'waterIntake') {
        const intakeSource = waterProcessComponent as IntakeSource;
        intakeSources.push(intakeSource);
      }
      if (waterProcessComponent.processComponentType === 'processUse') {
        processUses.push(waterProcessComponent as ProcessUse)
      }
      if (waterProcessComponent.processComponentType === 'waterDischarge') {
        dischargeOutlets.push(waterProcessComponent as DischargeOutlet)
      }

    })
    assessment.water.intakeSources = intakeSources.length > 0? intakeSources : undefined;
    assessment.water.processUses = processUses.length > 0? processUses : undefined;
    assessment.water.dischargeOutlets = dischargeOutlets.length > 0? dischargeOutlets : undefined;
    // setConnectedPartsFromEdges()

  }

  setConnectedPartsFromEdges() {

  }

  addNewProcessComponent(waterAssessment: WaterAssessment, fromComponent?: WaterProcessComponent) {
    // todo 6875 better shared methods
    // let newComponent = getNewProcessComponent('waterIntake');
    
    return {
      newComponent: undefined,
      waterAssessment: waterAssessment
    }
  }

  continue() {
    let tmpSetupTab: WaterSetupTabString = this.setupTab.getValue();
    let assessmentTabIndex: number = this.setupTabs.indexOf(tmpSetupTab);
    let nextTab: WaterSetupTabString = this.setupTabs[assessmentTabIndex + 1];
    this.setupTab.next(nextTab);
  }

  back() {
    let tmpSetupTab: WaterSetupTabString = this.setupTab.getValue();
    if (tmpSetupTab !== 'system-basics' && this.mainTab.getValue() == 'system-setup') {
      let assessmentTabIndex: number = this.setupTabs.indexOf(tmpSetupTab);
      let nextTab: WaterSetupTabString = this.setupTabs[assessmentTabIndex - 1];
      this.setupTab.next(nextTab);
    } else if (this.mainTab.getValue() == 'assessment') {
      this.mainTab.next('system-setup');
    }
  }

}

export type WaterSetupTabString = 'system-basics' | 'intake-source' | 'process-use' | 'system-balance-results';