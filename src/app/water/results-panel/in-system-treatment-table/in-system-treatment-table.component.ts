import { Component } from '@angular/core';
import { getNewNodeId, getWaterTreatmentComponent, WaterTreatment, WaterUsingSystem } from 'process-flow-lib';
import { Subscription } from 'rxjs';
import { ConfirmDeleteData } from '../../../shared/confirm-delete-modal/confirmDeleteData';
import { Settings } from '../../../shared/models/settings';
import { WaterAssessmentService } from '../../water-assessment.service';
import { WaterSystemComponentService } from '../../water-system-component.service';
import * as _ from 'lodash';
import { copyObject } from '../../../shared/helperFunctions';

@Component({
  selector: 'app-in-system-treatment-table',
  standalone: false,
  templateUrl: './in-system-treatment-table.component.html',
  styleUrl: './in-system-treatment-table.component.css'
})
export class InSystemTreatmentTableComponent {
  selectedComponent: WaterTreatment;
  selectedViewComponents: Array<WaterTreatment>;
  showConfirmDeleteModal: boolean = false;
  deleteSelectedId: string;
  hasInvalidComponents: boolean = false;
  confirmDeleteData: ConfirmDeleteData;

  settings: Settings;
  setupTabSub: Subscription;
  mainTabSub: Subscription;
  inSystemTreatmentSub: Subscription
  selectedSystemTreatmentSub: Subscription;
  constructor(private waterAssessmentService: WaterAssessmentService, private waterSystemComponentService: WaterSystemComponentService) { }

  ngOnInit(): void {
    this.settings = this.waterAssessmentService.settings.getValue();

    this.selectedSystemTreatmentSub = this.waterSystemComponentService.selectedInSystemTreatment.subscribe(inSystemTreatment => {
        this.selectedComponent = inSystemTreatment as WaterTreatment;
    });

    this.inSystemTreatmentSub = this.waterSystemComponentService.inSystemTreatmentComponents.subscribe(viewComponents => {
      this.selectedViewComponents = _.orderBy(viewComponents, 'modifiedDate', 'desc');
    });

    this.setDefaultSelectedComponent();
  }

  ngOnDestroy() {
    this.selectedSystemTreatmentSub.unsubscribe();
    this.inSystemTreatmentSub.unsubscribe();
  }

  setDefaultSelectedComponent() {
    if (!this.selectedComponent) {
      let lastModified: WaterTreatment = _.maxBy(this.selectedViewComponents, 'modifiedDate');
      this.waterSystemComponentService.selectedInSystemTreatment.next(lastModified);
    }
  }

  selectItem(item: WaterTreatment) {
    this.waterSystemComponentService.selectedInSystemTreatment.next(item);
  }

  addNewComponent() {
    let newWaterTreatment = getWaterTreatmentComponent(undefined, false, true);
    let selectedSystem: WaterUsingSystem = this.waterSystemComponentService.selectedComponent.getValue() as WaterUsingSystem;
    selectedSystem.inSystemTreatment ? selectedSystem.inSystemTreatment.push(newWaterTreatment) : selectedSystem.inSystemTreatment = [newWaterTreatment];
    
    this.updateAssessmentSystem(selectedSystem);
    this.waterSystemComponentService.selectedInSystemTreatment.next(newWaterTreatment);
  }

  deleteComponent() {
    let isSelectedComponent: boolean = this.deleteSelectedId === this.selectedComponent.diagramNodeId;
    let selectedSystem: WaterUsingSystem = this.waterSystemComponentService.selectedComponent.getValue() as WaterUsingSystem;
    let deleteIndex = selectedSystem.inSystemTreatment.findIndex(component => component.diagramNodeId === this.selectedComponent.diagramNodeId);
    selectedSystem.inSystemTreatment.splice(deleteIndex, 1);
    this.waterSystemComponentService.inSystemTreatmentComponents.next(selectedSystem.inSystemTreatment);
    this.updateAssessmentSystem(selectedSystem);
    
    if (isSelectedComponent) {
      this.waterSystemComponentService.selectedInSystemTreatment.next(this.selectedViewComponents[0]);
    }
  }

  updateAssessmentSystem(selectedSystem: WaterUsingSystem) {
    let waterAssessment = this.waterAssessmentService.waterAssessment.getValue();
    let updateSystemIndex: number = waterAssessment.waterUsingSystems.findIndex(system => system.diagramNodeId === selectedSystem.diagramNodeId);
    waterAssessment.waterUsingSystems[updateSystemIndex] = selectedSystem;
    this.waterAssessmentService.updateWaterAssessment(waterAssessment);
  }

  openConfirmDeleteModal(component: WaterTreatment) {
    this.confirmDeleteData = {
      modalTitle: `Delete System Treatment`,
      confirmMessage: `Are you sure you want to delete '${component.name}'?`
    }
    this.showConfirmDeleteModal = true;
    this.deleteSelectedId = component.diagramNodeId;
    this.waterAssessmentService.modalOpen.next(true);
  }

  onConfirmDeleteClose(deleteWaterComponent: boolean) {
    if (deleteWaterComponent) {
      this.deleteComponent();
    }
    this.showConfirmDeleteModal = false;
    this.waterAssessmentService.modalOpen.next(false);
  }

}
