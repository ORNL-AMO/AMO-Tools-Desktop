import { Component, Input } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { PlantIntakeDischargeTab, WaterAssessmentService } from '../water-assessment.service';
import { WaterSystemComponentService } from '../water-system-component.service';
import * as _ from 'lodash';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { copyObject } from '../../shared/helperFunctions';
import { MotorEnergyService } from '../water-using-system/added-energy/motor-energy/motor-energy.service';
import { ConfirmDeleteData } from '../../shared/confirm-delete-modal/confirmDeleteData';
import { IntakeSource, intakeSourceTypeOptions, MonthlyFlowData, MotorEnergy, WaterAssessment } from 'process-flow-lib';

@Component({
  selector: 'app-intake-source',
  standalone: false,
  templateUrl: './intake-source.component.html',
  styleUrl: './intake-source.component.css'
})
export class IntakeSourceComponent {
  settings: Settings;
  componentFormTitle: string;
  waterAssessment: WaterAssessment;
  selectedIntakeSource: IntakeSource;
  form: FormGroup;
  selectedComponentSub: Subscription;
  intakeSourceTypeOptions: { value: number, display: string }[];

  showConfirmDeleteModal: boolean = false;
  deleteIndex: number;
  confirmDeleteData: ConfirmDeleteData;
  showMonthlyFlowModal: boolean;

  idString: string;
  intakeSourceTabSub: Subscription;
  intakeSourceTab: PlantIntakeDischargeTab;
  intakeSourceTabTitle: string;

  constructor(private waterAssessmentService: WaterAssessmentService,
    private motorEnergyService: MotorEnergyService,
    private waterSystemComponentService: WaterSystemComponentService) { }

  ngOnInit() {
    this.intakeSourceTypeOptions = copyObject(intakeSourceTypeOptions);
    this.settings = this.waterAssessmentService.settings.getValue();
    this.componentFormTitle = this.waterAssessmentService.setWaterProcessComponentTitle('water-intake');

    this.selectedComponentSub = this.waterSystemComponentService.selectedComponent.subscribe(selectedComponent => {
      this.selectedIntakeSource = selectedComponent as IntakeSource;
      this.waterAssessment = this.waterAssessmentService.waterAssessment.getValue();
      this.waterSystemComponentService.selectedViewComponents.next(this.waterAssessment.intakeSources);
      if (this.selectedIntakeSource) {
        this.idString = this.componentFormTitle + this.selectedIntakeSource.diagramNodeId;
        this.initForm();
      }
    });

    this.intakeSourceTabSub = this.waterAssessmentService.intakeSourceTab.subscribe(val => {
      this.intakeSourceTab = val;
      this.intakeSourceTabTitle = this.waterAssessmentService.setIntakeSourceTabTitle(this.intakeSourceTab);
    });

    this.setDefaultSelectedComponent();
  }

  ngOnDestroy() {
    this.selectedComponentSub.unsubscribe();
  }

  setDefaultSelectedComponent() {
    this.waterSystemComponentService.setDefaultSelectedComponent(this.waterAssessment.intakeSources, this.selectedIntakeSource, 'water-intake')
  }

  initForm() {
    this.form = this.waterSystemComponentService.getIntakeSourceForm(this.selectedIntakeSource);
  }

  save(updated?: IntakeSource) {
    if (!updated) {
      updated = this.waterSystemComponentService.getIntakeSourceFromForm(this.form, this.selectedIntakeSource);
    }
    let updateIndex: number = this.waterAssessment.intakeSources.findIndex(intake => intake.diagramNodeId === updated.diagramNodeId);
    this.waterAssessment.intakeSources[updateIndex] = updated;
    this.waterAssessmentService.waterAssessment.next(this.waterAssessment);
  }


  setIntakeSourceType() {
    this.save();
  }

  focusField(str: string) {
    this.waterAssessmentService.focusedField.next(str);
  }

  addIntakeSource() {
    this.waterAssessmentService.addNewWaterComponent('water-intake')
  }
  
  saveMotorEnergy(updatedMotorEnergy: MotorEnergy, index: number) {
    this.motorEnergyService.updateMotorEnergy(this.selectedIntakeSource.addedMotorEnergy, updatedMotorEnergy, index)
    this.save();
  }

  addNewMotorEnergy() {
    this.selectedIntakeSource.addedMotorEnergy.push(
      this.motorEnergyService.getDefaultMotorEnergy(this.selectedIntakeSource.addedMotorEnergy.length)
    );
    this.save();
  }

  deleteMotorEnergy() {
    this.selectedIntakeSource.addedMotorEnergy.splice(this.deleteIndex, 1);
    this.save();
  }

  addMotorEnergyFromInventory() { }

  openConfirmDeleteModal(item: MotorEnergy, index: number) {
    this.confirmDeleteData = {
      modalTitle: 'Delete Added Pump Energy',
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

  setMonthlyFlow(monthlyFlowData: MonthlyFlowData[]) {
    let totalAnnualUse: number = this.waterSystemComponentService.getAnnualUseFromMonthly(monthlyFlowData);
    this.form.controls.annualUse.patchValue(totalAnnualUse)
    this.selectedIntakeSource.annualUse = totalAnnualUse;
    this.selectedIntakeSource.monthlyFlow = monthlyFlowData;
    this.save();
    this.setMonthlyFlowModal(false);

  }

  setMonthlyFlowModal(isOpen: boolean) {
    this.waterAssessmentService.modalOpen.next(isOpen);
    this.showMonthlyFlowModal = isOpen;
  }

}
