import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { Settings } from '../shared/models/settings';
import { WaterSystemComponentService } from './water-system-component.service';
import { WaterUsingSystemService } from './water-using-system/water-using-system.service';
import { DiagramWaterSystemFlows, DischargeOutlet, EdgeFlowData, getComponentNameFromType, getDischargeOutlet, getIntakeSource, getWasteWaterTreatmentComponent, getWaterTreatmentComponent, getWaterUsingSystem, IntakeSource, WasteWaterTreatment, WaterAssessment, WaterProcessComponent, WaterProcessComponentType, WaterTreatment, WaterUsingSystem } from 'process-flow-lib';

@Injectable({
  providedIn: 'root'
})
export class WaterAssessmentService {
  assessmentId: number;
  settings: BehaviorSubject<Settings>;
  mainTab: BehaviorSubject<string>;
  setupTab: BehaviorSubject<WaterSetupTabString>;
  waterUsingSystemTab: BehaviorSubject<WaterUsingSystemTabString>;
  intakeSourceTab: BehaviorSubject<PlantIntakeDischargeTab>;
  dischargeOutletTab: BehaviorSubject<PlantIntakeDischargeTab>;
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
    private waterSystemComponentService: WaterSystemComponentService,
    private waterUsingSystemService: WaterUsingSystemService,
    private convertUnitsService: ConvertUnitsService) {
    this.settings = new BehaviorSubject<Settings>(undefined);
    this.mainTab = new BehaviorSubject<string>('system-setup');
    this.setupTab = new BehaviorSubject<WaterSetupTabString>('system-basics');
    this.waterUsingSystemTab = new BehaviorSubject<WaterUsingSystemTabString>('system');
    this.intakeSourceTab = new BehaviorSubject<PlantIntakeDischargeTab>('data');
    this.dischargeOutletTab = new BehaviorSubject<PlantIntakeDischargeTab>('data');
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
    // console.log('updateWaterAssessment', waterAssessment);
    this.waterAssessment.next(waterAssessment);
  }

  setConnectedPartsFromEdges() {

  }

  setWaterProcessComponentTitle(componentType: WaterProcessComponentType) {
    return getComponentNameFromType(componentType);
  }

  setIntakeSourceTabTitle(tabString: PlantIntakeDischargeTab) {
    switch (tabString) {
      case 'data':
        return 'Intake Data'
      case 'added-energy':
        return 'Added Motor Energy'
      default:
         return 'Intake Data'
    }
  }

  
  setDischargeOutletTabTitle(tabString: PlantIntakeDischargeTab) {
    switch (tabString) {
      case 'data':
        return 'Discharge Data'
      case 'added-energy':
        return 'Added Motor Energy'
      default:
         return 'Discharge Data'
    }
  }

  setWaterSystemTabTitle(tabString: WaterUsingSystemTabString) {
    switch (tabString) {
      case 'system':
        return 'Water System Data'
      case 'added-energy':
        return 'Added Heat and Motor Energy'
      case 'water-treatment':
        return 'Water Treatment'
      default:
         return 'Water System Data'
    }
  }

  addNewWaterComponent(componentType: WaterProcessComponentType) {
    let waterAssessment: WaterAssessment = this.waterAssessment.getValue();
    let newComponent: WaterProcessComponent;
    if (componentType === 'water-intake') {
      let newIntakeSource = getIntakeSource();
      waterAssessment.intakeSources? waterAssessment.intakeSources.push(newIntakeSource) : waterAssessment.intakeSources = [newIntakeSource];
      newComponent = newIntakeSource;
    } else if (componentType === 'water-discharge') {
      let newDischargeOutlet = getDischargeOutlet();
      waterAssessment.dischargeOutlets? waterAssessment.dischargeOutlets.push(newDischargeOutlet) : waterAssessment.dischargeOutlets = [newDischargeOutlet];
      newComponent = newDischargeOutlet;
    } else if (componentType === 'water-using-system') {
      let newWaterUsingSystem = getWaterUsingSystem();
      waterAssessment.waterUsingSystems? waterAssessment.waterUsingSystems.push(newWaterUsingSystem) : waterAssessment.waterUsingSystems = [newWaterUsingSystem];
      let componentWaterFlows = this.getDefaultDiagramWaterFlows();
      componentWaterFlows.id = newWaterUsingSystem.diagramNodeId;
      waterAssessment.diagramWaterSystemFlows.push(componentWaterFlows);
      newComponent = newWaterUsingSystem;
    } else if (componentType === 'water-treatment') {
      let newWaterTreatment = getWaterTreatmentComponent(undefined, false, true);
      waterAssessment.waterTreatments? waterAssessment.waterTreatments.push(newWaterTreatment) : waterAssessment.waterTreatments = [newWaterTreatment];
      newComponent = newWaterTreatment;
    } else if (componentType === 'waste-water-treatment') {
      let newWasteTreatment = getWasteWaterTreatmentComponent();
      waterAssessment.wasteWaterTreatments? waterAssessment.wasteWaterTreatments.push(newWasteTreatment) : waterAssessment.wasteWaterTreatments = [newWasteTreatment];
      newComponent = newWasteTreatment;
    }

    this.updateWaterAssessment(waterAssessment);
    this.waterSystemComponentService.selectedComponent.next(newComponent);
  }

  copyWaterComponent(componentType: WaterProcessComponentType, copiedComponent: WaterProcessComponent) {
    let waterAssessment: WaterAssessment = this.waterAssessment.getValue();

    if (componentType === 'water-intake') {
      copiedComponent = copiedComponent as IntakeSource;
      waterAssessment.intakeSources? waterAssessment.intakeSources.push(copiedComponent) : waterAssessment.intakeSources = [copiedComponent];
    } else if (componentType === 'water-discharge') {
      copiedComponent = copiedComponent as DischargeOutlet;
      waterAssessment.dischargeOutlets? waterAssessment.dischargeOutlets.push(copiedComponent) : waterAssessment.dischargeOutlets = [copiedComponent];
    } else if (componentType === 'water-using-system') {
      copiedComponent = copiedComponent as WaterUsingSystem;
      waterAssessment.waterUsingSystems? waterAssessment.waterUsingSystems.push(copiedComponent) : waterAssessment.waterUsingSystems = [copiedComponent];
    } 

    this.updateWaterAssessment(waterAssessment);
    this.waterSystemComponentService.selectedComponent.next(copiedComponent);
  }


  deleteWaterComponent(componentType: WaterProcessComponentType, deleteId: string, isSelectedComponent?: boolean) {
    let waterAssessment: WaterAssessment = this.waterAssessment.getValue();
    let updatedViewComponents: WaterProcessComponent[];
    let deleteIndex: number;

    if (componentType === 'water-intake') {
      deleteIndex = waterAssessment.intakeSources.findIndex(component => component.diagramNodeId === deleteId);
      waterAssessment.intakeSources.splice(deleteIndex, 1);
      updatedViewComponents = waterAssessment.intakeSources;
    } else if (componentType === 'water-discharge') {
      deleteIndex = waterAssessment.dischargeOutlets.findIndex(component => component.diagramNodeId === deleteId);
      waterAssessment.dischargeOutlets.splice(deleteIndex, 1);
      updatedViewComponents = waterAssessment.dischargeOutlets;
    } else if (componentType === 'water-treatment') {
      deleteIndex = waterAssessment.waterTreatments.findIndex(component => component.diagramNodeId === deleteId);
      waterAssessment.waterTreatments.splice(deleteIndex, 1);
      updatedViewComponents = waterAssessment.wasteWaterTreatments;
    } else if (componentType === 'water-using-system') {
      deleteIndex = waterAssessment.waterUsingSystems.findIndex(component => component.diagramNodeId === deleteId);
      waterAssessment.waterUsingSystems.splice(deleteIndex, 1);
      updatedViewComponents = waterAssessment.waterUsingSystems;
    } else if (componentType === 'waste-water-treatment') {
      deleteIndex = waterAssessment.wasteWaterTreatments.findIndex(component => component.diagramNodeId === deleteId);
      waterAssessment.wasteWaterTreatments.splice(deleteIndex, 1);
      updatedViewComponents = waterAssessment.wasteWaterTreatments;
    }
    
    this.updateWaterAssessment(waterAssessment);
    this.waterSystemComponentService.selectedViewComponents.next(updatedViewComponents);
    if (isSelectedComponent) {
      this.waterSystemComponentService.selectedComponent.next(updatedViewComponents[0]);
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

  getHasWaterTreatments(waterAssessment?: WaterAssessment) {
    // todo and valid
    if (!waterAssessment) {
      waterAssessment = this.waterAssessment.getValue();
    }
    return waterAssessment.waterTreatments && waterAssessment.waterTreatments.length > 0;
  }

  getHasWasteWaterTreatments(waterAssessment?: WaterAssessment) {
    // todo and valid
    if (!waterAssessment) {
      waterAssessment = this.waterAssessment.getValue();
    }
    return waterAssessment.wasteWaterTreatments && waterAssessment.wasteWaterTreatments.length > 0;
  }

  // todo 6927 this will need work to check which treatment is requesting options
  getAvailableTreatmentOptions(treatments: WaterTreatment[] | WasteWaterTreatment[], treatmentOptions: {display: string, value: number}[]) {
    // let existingTreatmentTypes = treatments.filter(treatment => treatment.customTreatmentType !== 15).map((treatment: WaterTreatment | WasteWaterTreatment) => treatment.treatmentType);
    // treatmentOptions = treatmentOptions.filter(option => !existingTreatmentTypes.includes(option.value));
    return treatmentOptions;
  }

  getDefaultDiagramWaterFlows(): DiagramWaterSystemFlows {
    return {
      id: undefined,
      componentName: undefined,
      sourceWater: {
        total: undefined,
        flows: []
      },
      recirculatedWater: {
        total: undefined,
        flows: []
      },
      dischargeWater: {
        total: undefined,
        flows: []
      },
      knownLosses: {
        total: undefined,
        flows: []
      },
      waterInProduct: {
        total: undefined,
        flows: []
      },
    }
  }

  // todo rename diagramWaterSystemFlows
  getSourceConnectionOptions(waterAssessment: WaterAssessment, diagramNodeId: string): {value: string, display: string}[] {
    // find all components not already listed as a connected source in FlowData of diagramWaterSystemFlow
    let connectionOptions = [].concat(
      waterAssessment.intakeSources,
      waterAssessment.waterUsingSystems,
      waterAssessment.waterTreatments,
    ).filter(component => component.diagramNodeId !== diagramNodeId).map(component => {
      return {
        value: component.diagramNodeId,
        display: component.name,
      };
    });

    return connectionOptions;
  }

  getSystemSourceFlows(waterAssessment: WaterAssessment, diagramNodeId: string): EdgeFlowData[] {
    let componentWaterFlows: DiagramWaterSystemFlows = waterAssessment.diagramWaterSystemFlows?.find(componentFlows => componentFlows.id === diagramNodeId);
    if (!componentWaterFlows) {
      return [];
    }
    return componentWaterFlows.sourceWater.flows.map(flow => flow);
  }

  updateSystemSourceFlowData(waterAssessment: WaterAssessment, flowData: EdgeFlowData): void {
    // todo if is connected to water system need to also add to discharge of that system 
    waterAssessment.diagramWaterSystemFlows = waterAssessment.diagramWaterSystemFlows.map(componentFlows => {
      if (componentFlows.id === flowData.target) {
        let existingFlowIndex = componentFlows.sourceWater.flows.findIndex(flow => flow.source !== undefined && flow.source === flowData.source);
        if (existingFlowIndex >= 0) {
          componentFlows.sourceWater.flows[existingFlowIndex] = flowData;
        } else {
          // todo map discharge also
          // waterAssessment.connectedNodesMap[flowData.source] = flowData.target;
          componentFlows.sourceWater.flows.push(flowData);
        }
      }
      return componentFlows;
    });
  }

  getAvailableConnectionOptions(existingFlows: EdgeFlowData[], connectionOptions:{value: string, display: string}[]): {value: string, display: string}[] {
    const existingFlowIds: string[] = existingFlows.map(flow => flow.source);
    connectionOptions = connectionOptions.filter(option => !existingFlowIds.includes(option.value));
    return connectionOptions;
  }
  

}

export type WaterSetupTabString = WaterProcessComponentType | 'system-basics' | 'system-balance-results';
export type WaterUsingSystemTabString = 'system' | 'added-energy' | 'water-treatment';
export type PlantIntakeDischargeTab = 'data' | 'added-energy';