import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { MotorEnergyService } from './motor-energy/motor-energy.service';
import { WaterUsingSystemService } from '../water-using-system.service';
import { WaterAssessmentService } from '../../water-assessment.service';
import { WaterSystemComponentService } from '../../water-system-component.service';
import { Settings } from '../../../shared/models/settings';
import { Subscription } from 'rxjs';
import { ConfirmDeleteData } from '../../../shared/confirm-delete-modal/confirmDeleteData';
import { HeatEnergy, MotorEnergy, WaterUsingSystem } from '../../../../process-flow-lib/water/types/water-components';
import { WaterAssessment } from 'process-flow-lib';

@Component({
  selector: 'app-added-energy',
  standalone: false,
  templateUrl: './added-energy.component.html',
  styleUrl: './added-energy.component.css'
})
export class AddedEnergyComponent {
  selectedWaterUsingSystem: WaterUsingSystem;
  waterAssessment: WaterAssessment;
  settings: Settings;
  selectedComponentSub: Subscription;

  showConfirmDeleteModal: boolean = false;
  deleteIndex: number;
  confirmDeleteData: ConfirmDeleteData;

  constructor(
    private motorEnergyService: MotorEnergyService,
    private waterAssessmentService: WaterAssessmentService, 
    private waterSystemComponentService: WaterSystemComponentService,
  ) {}

  ngOnInit() {
    this.selectedComponentSub = this.waterSystemComponentService.selectedComponent.subscribe(selectedComponent => {
      this.selectedWaterUsingSystem = selectedComponent as WaterUsingSystem;
      this.waterAssessment = this.waterAssessmentService.waterAssessment.getValue();
    });

  }

  focusField(str: string) {
    this.waterAssessmentService.focusedField.next(str);
  }

  /**
* Update selectedWaterUsingSystem in water assessment
* @param updatedWaterUsingSystem Pass when sub-form (ProcessUse, MotorEnergy, etc) updates system data.
*/
  save(updatedWaterUsingSystem: WaterUsingSystem) {
    let updateIndex: number = this.waterAssessment.waterUsingSystems.findIndex(system => system.diagramNodeId === updatedWaterUsingSystem.diagramNodeId);
    this.waterAssessment.waterUsingSystems[updateIndex] = updatedWaterUsingSystem;
    this.waterAssessmentService.waterAssessment.next(this.waterAssessment);
  }

    
  saveHeatEnergy(updatedHeatEnergy: HeatEnergy) {
    this.selectedWaterUsingSystem.heatEnergy = updatedHeatEnergy;
    this.save(this.selectedWaterUsingSystem);
  }

  saveMotorEnergy(updatedMotorEnergy: MotorEnergy, index: number) {
    this.selectedWaterUsingSystem.addedMotorEnergy = this.motorEnergyService.updateMotorEnergy(this.selectedWaterUsingSystem.addedMotorEnergy, updatedMotorEnergy, index)
    this.save(this.selectedWaterUsingSystem);
  }

  
  addNewMotorEnergy() {
    this.selectedWaterUsingSystem.addedMotorEnergy.push(
      this.motorEnergyService.getDefaultMotorEnergy(this.selectedWaterUsingSystem.addedMotorEnergy.length)
    );
    this.save(this.selectedWaterUsingSystem);
  }

  addMotorEnergyFromInventory () {}

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
    this.selectedWaterUsingSystem.addedMotorEnergy.splice(this.deleteIndex, 1);
    this.save(this.selectedWaterUsingSystem);
  }


}
