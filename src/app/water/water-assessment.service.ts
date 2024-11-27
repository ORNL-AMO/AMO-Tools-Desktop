import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { Settings } from '../shared/models/settings';
import {  DiagramWaterSystemFlows, DischargeOutlet, IntakeSource, WasteWaterTreatment, WaterAssessment, WaterProcessComponent, WaterTreatment, WaterUsingSystem } from '../shared/models/water-assessment';
import { ProcessFlowPart, WaterProcessComponentType, getComponentNameFromType, getNewProcessComponent } from '../../process-flow-types/shared-process-flow-types';
import { WaterSystemComponentService } from './water-system-component.service';
import { WaterUsingSystemService } from './water-using-system/water-using-system.service';
// todo 6875 measur compiler doesn't like pulling in this module because it's from jsx

@Injectable({
  providedIn: 'root'
})
export class WaterAssessmentService {
  assessmentId: number;
  settings: BehaviorSubject<Settings>;
  mainTab: BehaviorSubject<string>;
  setupTab: BehaviorSubject<WaterSetupTabString>;
  waterUsingSystemTab: BehaviorSubject<WaterUsingSystemTabString>;
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
      let newIntakeSource = this.waterSystemComponentService.addIntakeSource();
      waterAssessment.intakeSources? waterAssessment.intakeSources.push(newIntakeSource) : waterAssessment.intakeSources = [newIntakeSource];
      newComponent = newIntakeSource;
    } else if (componentType === 'water-discharge') {
      let newDischargeOutlet = this.waterSystemComponentService.addDischargeOutlet();
      waterAssessment.dischargeOutlets? waterAssessment.dischargeOutlets.push(newDischargeOutlet) : waterAssessment.dischargeOutlets = [newDischargeOutlet];
      newComponent = newDischargeOutlet;
    } else if (componentType === 'water-using-system') {
      let newWaterUsingSystem = this.waterUsingSystemService.addWaterUsingSystem();
      waterAssessment.waterUsingSystems? waterAssessment.waterUsingSystems.push(newWaterUsingSystem) : waterAssessment.waterUsingSystems = [newWaterUsingSystem];
      newComponent = newWaterUsingSystem;
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
    } else if (componentType === 'waste-water-treatment') {
      copiedComponent = copiedComponent as WasteWaterTreatment;
      waterAssessment.waterUsingSystems? waterAssessment.wasteWaterTreatments.push(copiedComponent) : waterAssessment.wasteWaterTreatments = [copiedComponent];
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
      recycledSourceWater: {
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
      dischargeWaterRecycled: {
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

}

export type WaterSetupTabString = WaterProcessComponentType | 'system-basics' | 'system-balance-results';
export type WaterUsingSystemTabString = 'system' | 'added-energy' | 'water-treatment';