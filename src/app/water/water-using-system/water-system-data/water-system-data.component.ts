import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { WaterAssessmentService } from '../../water-assessment.service';
import { WaterAssessmentResultsService } from '../../water-assessment-results.service';
import { WaterSystemComponentService } from '../../water-system-component.service';
import { WaterUsingSystemService } from '../water-using-system.service';
import { copyObject } from '../../../shared/helperFunctions';
import { OperatingHours } from '../../../shared/models/operations';
import { ConnectedFlowType, ComponentEdgeFlowData, WaterAssessment, WaterProcessComponent, WaterSystemResults, WaterUsingSystem, waterUsingSystemTypeOptions } from 'process-flow-lib';

@Component({
  selector: 'app-water-system-data',
  standalone: false,
  templateUrl: './water-system-data.component.html',
  styleUrl: './water-system-data.component.css'
})
export class WaterSystemDataComponent {
  selectedWaterUsingSystem: WaterUsingSystem;
  selectedSystemType: number;
  waterAssessment: WaterAssessment;
  settings: Settings;
  componentFormTitle: string;
  form: FormGroup;
  selectedComponentSub: Subscription;

  isCollapsed: Record<WaterSystemGroupString, boolean> = {
    waterFlows: false,
    waterSources: false,
    motorEnergy: true,
    processUse: true
  };
  systemTypeOptions: {value: number, display: string}[];
  showWaterSystemDataModal: boolean = false;
  showOperatingHoursModal: boolean = false;

  waterSystemResults: WaterSystemResults;
  waterUsingSystemTabSub: Subscription;
  waterUsingSystemTab: string;

  componentEdgeFlowData: ComponentEdgeFlowData;
  
  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }
  formWidth: number;
  
  constructor(private waterAssessmentService: WaterAssessmentService, 
    private waterAssessmentResultsService: WaterAssessmentResultsService,
    private waterSystemComponentService: WaterSystemComponentService,
    private waterUsingSystemService: WaterUsingSystemService
  ) {}

  ngOnInit() {
    this.systemTypeOptions = copyObject(waterUsingSystemTypeOptions);
    this.settings = this.waterAssessmentService.settings.getValue();
    this.selectedComponentSub = this.waterSystemComponentService.selectedComponent.subscribe(selectedComponent => {
      this.selectedWaterUsingSystem = selectedComponent as WaterUsingSystem;
      this.waterAssessment = this.waterAssessmentService.waterAssessment.getValue();
      this.waterSystemComponentService.selectedViewComponents.next(this.waterAssessment.waterUsingSystems as WaterProcessComponent[]);
      if (this.selectedWaterUsingSystem) {
        // todo 7121 do we need to call this anymore (only on estimate modal)
        this.waterSystemResults = this.waterAssessmentResultsService.getWaterSystemResults(this.selectedWaterUsingSystem, this.waterAssessment, this.settings);
        this.initForm();
      }
    });

    this.waterUsingSystemTabSub = this.waterAssessmentService.waterUsingSystemTab.subscribe(val => {
      this.waterUsingSystemTab = val;
    });

    this.setDefaultSelectedComponent();
  }

  ngOnDestroy() {
    this.selectedComponentSub.unsubscribe();
    this.waterUsingSystemTabSub.unsubscribe();
  }

  setDefaultSelectedComponent() {
    this.waterSystemComponentService.setDefaultSelectedComponent(this.waterAssessment.waterUsingSystems, this.selectedWaterUsingSystem, 'water-using-system');
  }

  initForm() {
    this.componentEdgeFlowData = this.waterAssessmentService.getDefaultDiagramWaterFlows();
    if (this.waterAssessment.componentEdgeFlowData && this.waterAssessment.componentEdgeFlowData.length > 0) {
      this.componentEdgeFlowData = this.waterAssessment.componentEdgeFlowData.find(componentFlows => componentFlows.id === this.selectedWaterUsingSystem.diagramNodeId);
    } 
    this.form = this.waterUsingSystemService.getWaterUsingSystemForm(this.selectedWaterUsingSystem, this.componentEdgeFlowData);
  }



  /**
 * Save Form user entered values to override values that were populated from diagram flows
 */
  saveWithUserOverride(controlName: ConnectedFlowType) {
    let updatedWaterUsingSystem: WaterUsingSystem = this.waterUsingSystemService.getWaterUsingSystemFromForm(this.form, this.selectedWaterUsingSystem);
    updatedWaterUsingSystem.userDiagramFlowOverrides[controlName] = this.form.get(controlName as string).value;
    this.updateWaterUsingSystem(updatedWaterUsingSystem);
  }

  restoreAllToDiagramValues() {
    if (this.componentEdgeFlowData) {
      Object.keys(this.componentEdgeFlowData)
      .filter(controlName => controlName !== 'id' && controlName !== 'componentName')
      .forEach((controlName: ConnectedFlowType) => {
        this.form.get(controlName as string).setValue(this.componentEdgeFlowData[controlName].total);
        this.selectedWaterUsingSystem.userDiagramFlowOverrides[controlName] = undefined;
      });
      let updatedWaterUsingSystem: WaterUsingSystem = this.waterUsingSystemService.getWaterUsingSystemFromForm(this.form, this.selectedWaterUsingSystem);
      this.updateWaterUsingSystem(updatedWaterUsingSystem);
    }
  }

  getIsDisabledRestoreAll() {}


  /**
 * Restore sum totals from diagram user data-entry
 */
  restoreToDiagramValue(controlName: ConnectedFlowType) {
    if (this.componentEdgeFlowData) {
      this.form.get(controlName as string).setValue(this.componentEdgeFlowData[controlName].total);
      let updatedWaterUsingSystem: WaterUsingSystem = this.waterUsingSystemService.getWaterUsingSystemFromForm(this.form, this.selectedWaterUsingSystem);
      updatedWaterUsingSystem.userDiagramFlowOverrides[controlName] = undefined;
      this.updateWaterUsingSystem(updatedWaterUsingSystem);
    }
  }

  getIsDisabledRestore(connectedFlowType: ConnectedFlowType): boolean {
    let hasUserOverride: boolean = this.selectedWaterUsingSystem.userDiagramFlowOverrides && this.selectedWaterUsingSystem.userDiagramFlowOverrides[connectedFlowType] !== undefined;
    let hasDiagramDefault: boolean = this.componentEdgeFlowData && this.componentEdgeFlowData[connectedFlowType].total !== undefined;
    return (hasUserOverride && !hasDiagramDefault) || !hasUserOverride;
  }

  /**
 * Update selectedWaterUsingSystem in water assessment
 * @param updatedWaterUsingSystem Pass when sub-form (ProcessUse, MotorEnergy, etc) updates system data.
 */
  saveForm(updatedWaterUsingSystem?: WaterUsingSystem) {
    if (!updatedWaterUsingSystem) {
      updatedWaterUsingSystem = this.waterUsingSystemService.getWaterUsingSystemFromForm(this.form, this.selectedWaterUsingSystem);
    }
    this.updateWaterUsingSystem(updatedWaterUsingSystem);
  }


  updateWaterUsingSystem(updatedWaterUsingSystem: WaterUsingSystem) {
    let updateIndex: number = this.waterAssessment.waterUsingSystems.findIndex(system => system.diagramNodeId === updatedWaterUsingSystem.diagramNodeId);
    this.waterAssessment.waterUsingSystems[updateIndex] = updatedWaterUsingSystem;
    this.waterAssessmentService.waterAssessment.next(this.waterAssessment);
       // todo 7121 do we need to call this anymore (only on estimate modal)
    this.waterSystemResults = this.waterAssessmentResultsService.getWaterSystemResults(updatedWaterUsingSystem, this.waterAssessment, this.settings);
  }

  toggleCollapse(group: WaterSystemGroupString) {
    this.isCollapsed[group] = !this.isCollapsed[group];
  }
  
  focusField(str: string) {
    this.waterAssessmentService.focusedField.next(str);
  }

  openWaterSystemDataModal() {
    this.showWaterSystemDataModal = true;
    this.waterAssessmentService.modalOpen.next(this.showWaterSystemDataModal);
  }

  closeWaterSystemDataModal() {
    this.showWaterSystemDataModal = false;
    this.waterAssessmentService.modalOpen.next(this.showWaterSystemDataModal)
  }

  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
  }

  openOperatingHoursModal() {
    this.showOperatingHoursModal = true;
  }

  updateOperatingHours(oppHours: OperatingHours) {
    this.waterUsingSystemService.operatingHours = oppHours;
    this.form.controls.hoursPerYear.patchValue(oppHours.hoursPerYear);
    this.saveForm();
    this.closeOperatingHoursModal();
  }
  setOpHoursModalWidth() {
    if (this.formElement && this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }


}

type WaterSystemGroupString = 'waterFlows' | 'waterSources' | 'motorEnergy' | 'processUse';
