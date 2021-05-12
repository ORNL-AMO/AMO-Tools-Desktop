import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressorInventoryItem } from '../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../compressed-air-assessment.service';
import { InventoryService } from './inventory.service';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit {

  hasInventoryItems: boolean;
  form: FormGroup;
  selectedCompressorSub: Subscription;
  isFormChange: boolean = false;
  compressorType: number;
  controlType: number;
  showCompressorModal: boolean = false;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private inventoryService: InventoryService, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.initializeInventory();
    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(val => {
      if (val) {
        this.compressorType = val.nameplateData.compressorType;
        this.controlType = val.compressorControls.controlType;
        if (this.isFormChange == false) {
          this.form = this.inventoryService.getGeneralInformationFormFromObj(val.name, val.description);
        } else {
          this.isFormChange = false;
        }
      }
    });
  }

  ngOnDestroy() {
    this.selectedCompressorSub.unsubscribe();
  }

  initializeInventory() {
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    this.hasInventoryItems = (compressedAirAssessment.compressorInventoryItems.length != 0);
    if (this.hasInventoryItems) {
      let selectedCompressor: CompressorInventoryItem = this.inventoryService.selectedCompressor.getValue();
      if (selectedCompressor) {
        let compressorExist: CompressorInventoryItem = compressedAirAssessment.compressorInventoryItems.find(item => { return item.itemId == selectedCompressor.itemId });
        if (!compressorExist) {
          this.inventoryService.selectedCompressor.next(compressedAirAssessment.compressorInventoryItems[0]);
        }
      } else {
        this.inventoryService.selectedCompressor.next(compressedAirAssessment.compressorInventoryItems[0]);
      }
    }
  }

  addInventoryItem() {
    let newInventoryItem: CompressorInventoryItem = this.inventoryService.getNewInventoryItem();
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    compressedAirAssessment.compressorInventoryItems.push(newInventoryItem);
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment);
    this.inventoryService.selectedCompressor.next(newInventoryItem);
    this.hasInventoryItems = true;
  }

  save() {
    let selectedCompressor: CompressorInventoryItem = this.inventoryService.selectedCompressor.getValue();
    selectedCompressor.name = this.form.controls.name.value;
    selectedCompressor.description = this.form.controls.description.value;
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let compressorIndex: number = compressedAirAssessment.compressorInventoryItems.findIndex(item => { return item.itemId == selectedCompressor.itemId });
    compressedAirAssessment.compressorInventoryItems[compressorIndex] = selectedCompressor;
    this.isFormChange = true;
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment);
    this.inventoryService.selectedCompressor.next(selectedCompressor);
  }

  openCompressorModal(){
    this.showCompressorModal = true;
    this.cd.detectChanges();
  }

  closeCompressorModal(){
    this.showCompressorModal = false;
    this.cd.detectChanges();
  }
}
