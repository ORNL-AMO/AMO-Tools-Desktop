import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { WasteWater, WasteWaterData } from '../../shared/models/waste-water';
import { WasteWaterService } from '../waste-water.service';

@Component({
  selector: 'app-add-modification-modal',
  templateUrl: './add-modification-modal.component.html',
  styleUrls: ['./add-modification-modal.component.css']
})
export class AddModificationModalComponent implements OnInit {

  @ViewChild('addNewModal', { static: false }) public addNewModal: ModalDirective;
  modificationExists: boolean;
  assessmentTab: string;
  newModificationName: string;
  constructor(private wasteWaterService: WasteWaterService) { }

  ngOnInit(): void {
    this.wasteWaterService.isModalOpen.next(true);
    let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
    this.newModificationName = 'Scenario ' + (wasteWater.modifications.length + 1);
    this.modificationExists = (this.wasteWaterService.getModificationFromId() != undefined);
    this.assessmentTab = this.wasteWaterService.assessmentTab.getValue();
  }

  ngAfterViewInit() {
    this.addNewModal.show();
  }

  closeAddNewModal() {
    this.wasteWaterService.isModalOpen.next(false);
    this.wasteWaterService.showAddModificationModal.next(false);
    this.addNewModal.hide();
  }

  addModification() {
    let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
    let modification: WasteWaterData = JSON.parse(JSON.stringify(wasteWater.baselineData));
    modification.exploreOpportunities = (this.assessmentTab == 'explore-opportunities');
    modification.name = this.newModificationName;
    modification.id = Math.random().toString(36).substr(2, 9);
    wasteWater.modifications.push(modification);
    this.wasteWaterService.updateWasteWater(wasteWater);
    this.wasteWaterService.selectedModificationId.next(modification.id);
    this.closeAddNewModal();
  }
}
