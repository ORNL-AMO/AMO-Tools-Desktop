import { Component } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { HeatEnergy, MotorEnergy, WaterAssessment, WaterProcessComponent, WaterUsingSystem } from '../../shared/models/water-assessment';
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


@Component({
  selector: 'app-water-using-system',
  templateUrl: './water-using-system.component.html',
  styleUrl: './water-using-system.component.css'
})
export class WaterUsingSystemComponent {
  settings: Settings;
  selectedWaterUsingSystem: WaterUsingSystem;
  componentFormTitle: string;
  form: FormGroup;
  selectedComponentSub: Subscription;
  isModalOpen: boolean = false;
  modalOpenSub: Subscription;

  waterAssessment: WaterAssessment;

  isCollapsed: Record<WaterSystemGroupString, boolean> = {
    waterFlows: false,
    waterSources: false,
    motorEnergy: true,
    processUse: true
  };

  waterUsingSystemResults = {
    grossWaterUse: undefined,
  }

  systemTypeOptions: {value: number, display: string}[];


  showConfirmDeleteModal: boolean = false;
  deleteIndex: number;
  confirmDeleteData: ConfirmDeleteData;

  constructor(private waterAssessmentService: WaterAssessmentService, 
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
   this.form = this.waterUsingSystemService.getWaterUsingSystemForm(this.selectedWaterUsingSystem);
  }

  save(updatedWaterUsingSystem?: WaterUsingSystem) {
    if (!updatedWaterUsingSystem) {
      updatedWaterUsingSystem = this.waterUsingSystemService.getWaterUsingSystemFromForm(this.form, this.selectedWaterUsingSystem);
    }
    let updateIndex: number = this.waterAssessment.waterUsingSystems.findIndex(system => system.diagramNodeId === updatedWaterUsingSystem.diagramNodeId);
    this.waterAssessment.waterUsingSystems[updateIndex] = updatedWaterUsingSystem;
    this.waterAssessmentService.waterAssessment.next(this.waterAssessment);
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


}

type WaterSystemGroupString = 'waterFlows' | 'waterSources' | 'motorEnergy' | 'processUse';
