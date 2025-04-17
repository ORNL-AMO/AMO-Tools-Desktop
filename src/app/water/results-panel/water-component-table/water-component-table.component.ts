import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConfirmDeleteData } from '../../../shared/confirm-delete-modal/confirmDeleteData';
import { Settings } from '../../../shared/models/settings';
import { WaterAssessmentService } from '../../water-assessment.service';
import { WaterSystemComponentService } from '../../water-system-component.service';
import { copyObject } from '../../../shared/helperFunctions';
import * as _ from 'lodash';
import { WaterProcessComponent, WaterProcessComponentType, getNewNodeId } from 'process-flow-lib';


@Component({
  selector: 'app-water-component-table',
  standalone: false,
  templateUrl: './water-component-table.component.html',
  styleUrl: './water-component-table.component.css'
})
export class WaterComponentTableComponent {
  selectedComponent: WaterProcessComponent;
  selectedComponentSub: Subscription;
  selectedViewComponentsSub: Subscription;
  selectedViewComponents: Array<WaterProcessComponent>;
  waterProcessComponentTitle: string;

  showConfirmDeleteModal: boolean = false;
  deleteSelectedId: string;
  hasInvalidComponents: boolean = false;
  confirmDeleteData: ConfirmDeleteData;
  activeComponentType: WaterProcessComponentType;

  settings: Settings;
  setupTabSub: Subscription;
  mainTabSub: Subscription;
  constructor(private waterAssessmentService: WaterAssessmentService, private waterSystemComponentService: WaterSystemComponentService) { }

  ngOnInit(): void {
    this.settings = this.waterAssessmentService.settings.getValue();
    this.selectedComponentSub = this.waterSystemComponentService.selectedComponent.subscribe(val => {
      this.selectedComponent = val;
    });
    this.setupTabSub = this.waterAssessmentService.setupTab.subscribe(setupTab => {
      this.activeComponentType = setupTab as WaterProcessComponentType;
      if (this.activeComponentType) {
        this.waterProcessComponentTitle = this.waterAssessmentService.setWaterProcessComponentTitle(this.activeComponentType);
      }
    });

    this.mainTabSub = this.waterAssessmentService.mainTab.subscribe(newMainTab => {
      if (newMainTab === 'diagram') {
        this.waterSystemComponentService.selectedComponent.next(undefined)
      }
    });

    this.selectedViewComponentsSub = this.waterSystemComponentService.selectedViewComponents.subscribe(viewComponents => {
      this.selectedViewComponents = _.orderBy(viewComponents, 'modifiedDate', 'desc');
    });

    this.setDefaultSelectedComponent();
  }

  ngOnDestroy() {
    this.selectedComponentSub.unsubscribe();
    this.selectedViewComponentsSub.unsubscribe();
    this.mainTabSub.unsubscribe();
    this.setupTabSub.unsubscribe();
  }

  setDefaultSelectedComponent() {
    if (!this.selectedComponent) {
      let lastModified: WaterProcessComponent = _.maxBy(this.selectedViewComponents, 'modifiedDate');
      this.waterSystemComponentService.selectedComponent.next(lastModified);
    }
  }

  selectItem(item: WaterProcessComponent) {
    this.waterSystemComponentService.selectedComponent.next(item);
  }

  addNewComponent() {
      this.waterAssessmentService.addNewWaterComponent(this.activeComponentType);
  }

  deleteComponent() {
    let isSelectedComponent: boolean = this.deleteSelectedId === this.selectedComponent.diagramNodeId;
    this.waterAssessmentService.deleteWaterComponent(this.activeComponentType, this.deleteSelectedId, isSelectedComponent);
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

  onConfirmDeleteClose(deleteWaterComponent: boolean) {
    if (deleteWaterComponent) {
      this.deleteComponent();
    }
    this.showConfirmDeleteModal = false;
    this.waterAssessmentService.modalOpen.next(false);
  }

  createCopy(component: WaterProcessComponent) {
    let copiedComponent: WaterProcessComponent = copyObject(component);
    copiedComponent.diagramNodeId = getNewNodeId();
    copiedComponent.name = copiedComponent.name + ' (copy)';
    this.waterAssessmentService.copyWaterComponent(this.activeComponentType, copiedComponent);
  }
}
