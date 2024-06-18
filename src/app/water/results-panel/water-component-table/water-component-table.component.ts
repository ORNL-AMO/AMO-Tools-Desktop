import { Component, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConfirmDeleteData } from '../../../shared/confirm-delete-modal/confirmDeleteData';
import { Settings } from '../../../shared/models/settings';
import { WaterAssessment, WaterProcessComponent } from '../../../shared/models/water-assessment';
import { WaterAssessmentService } from '../../water-assessment.service';
import { WaterProcessComponentService } from '../../water-system-component.service';
// import { getNewNodeId } from '../../../../../process-flow-diagram-component/src/components/Flow/process-flow-utils';
// todo 6875 measur compiler doesn't like pulling in this module because it's from jsx

@Component({
  selector: 'app-water-component-table',
  templateUrl: './water-component-table.component.html',
  styleUrl: './water-component-table.component.css'
})
export class WaterComponentTableComponent {
  
  waterAssessmentSub: Subscription;
  selectedComponent: WaterProcessComponent;
  selectedComponentSub: Subscription;
  selectedViewComponentsSub: Subscription;
  selectedViewComponents: Array<WaterProcessComponent>;

  showConfirmDeleteModal: boolean = false;
  deleteSelectedId: string;
  hasInvalidComponents: boolean = false;
  confirmDeleteData: ConfirmDeleteData;

  settings: Settings;
  constructor(private waterAssessmentService: WaterAssessmentService, private waterProcessComponentService: WaterProcessComponentService) { }

  ngOnInit(): void {
    this.settings = this.waterAssessmentService.settings.getValue();
    this.selectedComponentSub = this.waterProcessComponentService.selectedComponent.subscribe(val => {
      this.selectedComponent = val;
      console.log('table selectedComponent', this.selectedComponent)
    })

    this.selectedViewComponentsSub = this.waterProcessComponentService.selectedViewComponents.subscribe(viewComponents => {
      this.selectedViewComponents = viewComponents;
      // todo get waterComponent type
      // todo set isValid
    });
  }

  ngOnDestroy() {
    this.selectedComponentSub.unsubscribe();
    this.selectedViewComponentsSub.unsubscribe();

  }

  selectItem(item: WaterProcessComponent) {
    this.waterProcessComponentService.selectedComponent.next(item);
  }

  addNewComponent() {
    // let waterAssessment: WaterAssessment = this.waterAssessmentService.waterAssessment.getValue();
    // let updated: { newComponent: WaterProcessComponent, waterAssessment: WaterAssessment } = this.waterAssessmentService.addNewProcessComponent(waterAssessment);
    // this.waterAssessmentService.updateWaterAssessment(updated.waterAssessment);
    // this.waterProcessComponentService.selectedComponent.next(updated.newComponent);
  }

  deleteItem() {
    // let waterAssessment: WaterAssessment = this.waterAssessmentService.waterAssessment.getValue();
    // todo delete, splice out
    // this.waterAssessmentService.updateWaterAssessment(waterAssessment);
    // todo set new default
    // this.waterProcessComponentService.selectedComponent.next(waterAssessment.waterProcessComponents[0]);
  }

  openConfirmDeleteModal(component: WaterProcessComponent) {
    this.confirmDeleteData = {
      modalTitle: `Delete Water System Component`,
      confirmMessage: `Are you sure you want to delete '${component.name}'?`
    }
    this.showConfirmDeleteModal = true;
    this.deleteSelectedId = component.diagramNodeId;
    this.waterAssessmentService.modalOpen.next(true);
  }

  onConfirmDeleteClose(deleteInventoryItem: boolean) {
    if (deleteInventoryItem) {
      this.deleteItem();
    }
    this.showConfirmDeleteModal = false;
    this.waterAssessmentService.modalOpen.next(false);
  }


  createCopy(component: WaterProcessComponent) {
    let waterAssessment: WaterAssessment = this.waterAssessmentService.waterAssessment.getValue();
    let copiedComponent: WaterProcessComponent = JSON.parse(JSON.stringify(component));
    // todo 6875 better shared methods
    // copiedComponent.diagramNodeId = getNewNodeId();
    copiedComponent.name = copiedComponent.name + ' (copy)';
    this.waterAssessmentService.addNewProcessComponent(waterAssessment, copiedComponent);
  }
}
