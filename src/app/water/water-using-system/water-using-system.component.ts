import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { HeatEnergy, MotorEnergy, WaterAssessment, WaterAssessmentResults, WaterProcessComponent, WaterSystemResults, WaterUsingSystem } from '../../shared/models/water-assessment';
import { Subscription } from 'rxjs';
import { WaterAssessmentService } from '../water-assessment.service';
import { FormGroup } from '@angular/forms';
import * as _ from 'lodash';
import { WaterUsingSystemService } from './water-using-system.service';
import { WaterProcessComponentService } from '../water-system-component.service';
import { copyObject } from '../../shared/helperFunctions';
import { waterUsingSystemTypeOptions } from '../waterConstants';
import { MotorEnergyService } from './motor-energy/motor-energy.service';
import { ConfirmDeleteData } from '../../shared/confirm-delete-modal/confirmDeleteData';
import { WaterAssessmentResultsService } from '../water-assessment-results.service';
import { OperatingHours } from '../../shared/models/operations';


@Component({
  selector: 'app-water-using-system',
  templateUrl: './water-using-system.component.html',
  styleUrl: './water-using-system.component.css'
})
export class WaterUsingSystemComponent {
  selectedWaterUsingSystem: WaterUsingSystem;
  selectedSystemType: number;
  waterAssessment: WaterAssessment;
  settings: Settings;
  componentFormTitle: string;
  form: FormGroup;
  selectedComponentSub: Subscription;
  modalOpenSub: Subscription;
  isModalOpen: boolean = false;

  isCollapsed: Record<WaterSystemGroupString, boolean> = {
    waterFlows: false,
    waterSources: false,
    motorEnergy: true,
    processUse: true
  };
  systemTypeOptions: {value: number, display: string}[];
  showConfirmDeleteModal: boolean = false;
  deleteIndex: number;
  confirmDeleteData: ConfirmDeleteData;
  showWaterSystemDataModal: boolean = false;
  showOperatingHoursModal: boolean = false;

  waterSystemResults: WaterSystemResults;
  
  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }
  formWidth: number;
  
  constructor(private waterAssessmentService: WaterAssessmentService, 
    private waterAssessmentResultsService: WaterAssessmentResultsService,
    private waterProcessComponentService: WaterProcessComponentService,
    private motorEnergyService: MotorEnergyService,
    private waterUsingSystemService: WaterUsingSystemService) {}

  ngOnInit() {
    this.systemTypeOptions = copyObject(waterUsingSystemTypeOptions);
    this.settings = this.waterAssessmentService.settings.getValue();
    this.componentFormTitle = this.waterAssessmentService.setWaterProcessComponentTitle('water-using-system');
    
    this.selectedComponentSub = this.waterProcessComponentService.selectedComponent.subscribe(selectedComponent => {
      this.selectedWaterUsingSystem = selectedComponent as WaterUsingSystem;
      this.waterAssessment = this.waterAssessmentService.waterAssessment.getValue();
      this.waterProcessComponentService.selectedViewComponents.next(this.waterAssessment.waterUsingSystems as WaterProcessComponent[]);
      if (this.selectedWaterUsingSystem) {
        this.initForm();
        this.setSystemType();
      }
    });

    this.modalOpenSub = this.waterAssessmentService.modalOpen.subscribe(isOpen => {
      this.isModalOpen = isOpen;
    });

    this.setDefaultSelectedComponent();
  }

  ngOnDestroy() {
    this.selectedComponentSub.unsubscribe();
    this.modalOpenSub.unsubscribe();
  }

  setDefaultSelectedComponent() {
    this.waterProcessComponentService.setDefaultSelectedComponent(this.waterAssessment.waterUsingSystems, this.selectedWaterUsingSystem, 'water-using-system')
  }

  initForm() {
   console.log(this.selectedWaterUsingSystem)
   this.form = this.waterUsingSystemService.getWaterUsingSystemForm(this.selectedWaterUsingSystem);
  }

  /**
 * Update selectedWaterUsingSystem in water assessment
 * @param updatedWaterUsingSystem Pass when sub-form (ProcessUse, MotorEnergy, etc) updates system data.
 */
  save(updatedWaterUsingSystem?: WaterUsingSystem) {
    if (!updatedWaterUsingSystem) {
      updatedWaterUsingSystem = this.waterUsingSystemService.getWaterUsingSystemFromForm(this.form, this.selectedWaterUsingSystem);
    }
    let updateIndex: number = this.waterAssessment.waterUsingSystems.findIndex(system => system.diagramNodeId === updatedWaterUsingSystem.diagramNodeId);
    this.waterAssessment.waterUsingSystems[updateIndex] = updatedWaterUsingSystem;
    this.waterAssessmentService.waterAssessment.next(this.waterAssessment);
    this.waterSystemResults = this.waterAssessmentResultsService.getWaterSystemResults(updatedWaterUsingSystem);
  }

  saveWaterSystemData(selectedWaterUsingSystem: WaterUsingSystem) {
    this.save(selectedWaterUsingSystem);
  }

  saveHeatEnergy(updatedHeatEnergy: HeatEnergy) {
    this.selectedWaterUsingSystem.heatEnergy = updatedHeatEnergy;
    this.save(this.selectedWaterUsingSystem);
  }

  saveMotorEnergy(updatedMotorEnergy: MotorEnergy, index: number) {
    this.motorEnergyService.updateMotorEnergy(this.selectedWaterUsingSystem.addedMotorEquipment, updatedMotorEnergy, index)
    this.save(this.selectedWaterUsingSystem);
  }


  focusField(str: string) {
    this.waterAssessmentService.focusedField.next(str);
  }

  addWaterUsingSystem() {
    this.waterAssessmentService.addNewWaterComponent('water-using-system')
  }

  setSystemType() {
    this.selectedSystemType = this.form.controls.systemType.value;
  }

  addNewMotorEnergy() {
    this.selectedWaterUsingSystem.addedMotorEquipment.push(
      this.motorEnergyService.getDefaultMotorEnergy(this.selectedWaterUsingSystem.addedMotorEquipment.length)
    );
    this.save(this.selectedWaterUsingSystem);
  }

  addMotorEnergyFromInventory () {}

  toggleCollapse(group: WaterSystemGroupString) {
    this.isCollapsed[group] = !this.isCollapsed[group];
  }

  openConfirmDeleteModal(item: MotorEnergy, index: number) {
    this.confirmDeleteData = {
      modalTitle: 'Delete Added Motor Energy',
      confirmMessage: `Are you sure you want to delete '${item.name}'?`
    }
    this.showConfirmDeleteModal = true;
    this.deleteIndex = index;
    this.waterAssessmentService.modalOpen.next(true);
  }

  onConfirmDeleteClose(shouldDelete: boolean) {
    if (shouldDelete) {
      this.deleteMotorEnergy();
    }
    this.showConfirmDeleteModal = false;
    this.waterAssessmentService.modalOpen.next(false);
  }

  deleteMotorEnergy() {
    this.selectedWaterUsingSystem.addedMotorEquipment.splice(this.deleteIndex, 1);
    this.save(this.selectedWaterUsingSystem);
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
    this.save();
    this.closeOperatingHoursModal();
  }

  
  setOpHoursModalWidth() {
    if (this.formElement && this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }


}

type WaterSystemGroupString = 'waterFlows' | 'waterSources' | 'motorEnergy' | 'processUse';
