import { Component } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import _ from 'lodash';
import { Subscription } from 'rxjs';
import { copyObject } from '../../shared/helperFunctions';
import { WaterAssessment, DischargeOutlet, WaterProcessComponent, MotorEnergy } from '../../shared/models/water-assessment';
import { WaterAssessmentService } from '../water-assessment.service';
import { WaterSystemComponentService } from '../water-system-component.service';
import { dischargeOutletTypeOptions } from '../waterConstants';
import { ConfirmDeleteData } from '../../shared/confirm-delete-modal/confirmDeleteData';
import { MotorEnergyService } from '../water-using-system/added-energy/motor-energy/motor-energy.service';

@Component({
  selector: 'app-discharge-outlet',
  templateUrl: './discharge-outlet.component.html',
  styleUrl: './discharge-outlet.component.css'
})
export class DischargeOutletComponent {
  settings: Settings;
  componentFormTitle: string;
  waterAssessment: WaterAssessment;
  selectedDischargeOutlet: DischargeOutlet;
  form: FormGroup;
  selectedComponentSub: Subscription;
  dischargeOutletTypeOptions: {value: number, display: string}[];

  showConfirmDeleteModal: boolean = false;
  deleteIndex: number;
  confirmDeleteData: ConfirmDeleteData;
  isMotorEnergyCollapsed: boolean;
  idString: string;
  constructor(private waterAssessmentService: WaterAssessmentService,
    private motorEnergyService: MotorEnergyService, 
    private waterSystemComponentService: WaterSystemComponentService) {}

  ngOnInit() {
    this.dischargeOutletTypeOptions = copyObject(dischargeOutletTypeOptions);
    this.settings = this.waterAssessmentService.settings.getValue();
    this.componentFormTitle = this.waterAssessmentService.setWaterProcessComponentTitle('water-discharge');

    this.selectedComponentSub = this.waterSystemComponentService.selectedComponent.subscribe(selectedComponent => {
      this.selectedDischargeOutlet = selectedComponent as DischargeOutlet;
      this.waterAssessment = this.waterAssessmentService.waterAssessment.getValue();
      this.waterSystemComponentService.selectedViewComponents.next(this.waterAssessment.dischargeOutlets);
      if (this.selectedDischargeOutlet) {
        this.idString = this.componentFormTitle + this.selectedDischargeOutlet.diagramNodeId;
        this.initForm();
      }
    });
    this.setDefaultSelectedComponent();
  }

  ngOnDestroy() {
    this.selectedComponentSub.unsubscribe();
  }

  setDefaultSelectedComponent() {
    this.waterSystemComponentService.setDefaultSelectedComponent(this.waterAssessment.dischargeOutlets, this.selectedDischargeOutlet, 'water-discharge')
  }

  initForm() {
    this.form = this.waterSystemComponentService.getDischargeOutletForm(this.selectedDischargeOutlet);
  }

  save() {
    let updated: DischargeOutlet = this.waterSystemComponentService.getDischargeOutletFromForm(this.form, this.selectedDischargeOutlet);
    let updateIndex: number = this.waterAssessment.dischargeOutlets.findIndex(discharge => discharge.diagramNodeId === updated.diagramNodeId);
    this.waterAssessment.dischargeOutlets[updateIndex] = updated;
    this.waterAssessmentService.waterAssessment.next(this.waterAssessment);
  }

  setDischargeOutletType() {
    this.save();
  }

  focusField(str: string) {
    this.waterAssessmentService.focusedField.next(str);
  }

  addDischargeOutlet() {
    this.waterAssessmentService.addNewWaterComponent('water-discharge')
  }

  
  toggleCollapseMotorEnergy() {
    this.isMotorEnergyCollapsed = !this.isMotorEnergyCollapsed;
  }
  
  saveMotorEnergy(updatedMotorEnergy: MotorEnergy, index: number) {
    this.motorEnergyService.updateMotorEnergy(this.selectedDischargeOutlet.addedMotorEnergy, updatedMotorEnergy, index)
    this.save();
  }
  
  addNewMotorEnergy() {
    this.selectedDischargeOutlet.addedMotorEnergy.push(
      this.motorEnergyService.getDefaultMotorEnergy(this.selectedDischargeOutlet.addedMotorEnergy.length)
    );
    this.save();
  }

  deleteMotorEnergy() {
    this.selectedDischargeOutlet.addedMotorEnergy.splice(this.deleteIndex, 1);
    this.save();
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

}
