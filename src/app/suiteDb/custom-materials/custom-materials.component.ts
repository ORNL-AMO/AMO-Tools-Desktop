import { Component, OnInit, Input, SimpleChanges, ViewChild } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { CustomMaterialsService, MaterialData } from './custom-materials.service';
import { ModalDirective } from 'ngx-bootstrap';
import { ImportExportService } from '../../shared/import-export/import-export.service';

@Component({
  selector: 'app-custom-materials',
  templateUrl: './custom-materials.component.html',
  styleUrls: ['./custom-materials.component.css']
})
export class CustomMaterialsComponent implements OnInit {
  @Input()
  settings: Settings;

  showFlueModal: boolean = false;
  showSolidLiquidFlueModal: boolean = false;
  showGasLoadChargeModal: boolean = false;
  showLiquidLoadChargeModal: boolean = false;
  showSolidLoadChargeModal: boolean = false;
  showAtmosphereModal: boolean = false;
  showWallSurfaceModal: boolean = false;

  showFlueMaterials: boolean = false;
  showSolidLiquidFlueMaterials: boolean = false;
  showGasLoadChargeMaterials: boolean = false;
  showLiquidLoadChargeMaterials: boolean = false;
  showSolidLoadChargeMaterials: boolean = false;
  showAtmosphereMaterials: boolean = false;
  showWallSurfaceMaterials: boolean = false;

  isAllSelected: boolean = false;

  @ViewChild('exportModal') public exportModal: ModalDirective;
  @ViewChild('importModal') public importModal: ModalDirective;
  selectedMaterialData: MaterialData;
  exportModalOpen: boolean = false;
  fileReference: any;
  isValidFile: boolean;
  importing: boolean = false;
  constructor(private customMaterialService: CustomMaterialsService, private importExportService: ImportExportService) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.customMaterialService.getSelected.next(false);
  }

  toggleModal(material: string) {
    switch (material) {
      case 'flue':
        this.showFlueModal = !this.showFlueModal;
        break;
      case 'solid-liquid-flue':
        this.showSolidLiquidFlueModal = !this.showSolidLiquidFlueModal;
        break;
      case 'gas-load':
        this.showGasLoadChargeModal = !this.showGasLoadChargeModal;
        break;
      case 'liquid-load':
        this.showLiquidLoadChargeModal = !this.showLiquidLoadChargeModal;
        break;
      case 'solid-load':
        this.showSolidLoadChargeModal = !this.showSolidLoadChargeModal;
        break;
      case 'atmosphere-material':
        this.showAtmosphereModal = !this.showAtmosphereModal;
        break;
      case 'wall-surface':
        this.showWallSurfaceModal = !this.showWallSurfaceModal;
        break;
      default:
        break;
    }

  }


  toggleMaterial(material: string) {
    switch (material) {
      case 'flue':
        this.showFlueMaterials = !this.showFlueMaterials;
        break;
      case 'solid-liquid-flue':
        this.showSolidLiquidFlueMaterials = !this.showSolidLiquidFlueMaterials;
        break;
      case 'gas-load':
        this.showGasLoadChargeMaterials = !this.showGasLoadChargeMaterials;
        break;
      case 'liquid-load':
        this.showLiquidLoadChargeMaterials = !this.showLiquidLoadChargeMaterials;
        break;
      case 'solid-load':
        this.showSolidLoadChargeMaterials = !this.showSolidLoadChargeMaterials;
        break;
      case 'atmosphere-material':
        this.showAtmosphereMaterials = !this.showAtmosphereMaterials;
        break;
      case 'wall-surface':
        this.showWallSurfaceMaterials = !this.showWallSurfaceMaterials;
        break;
      default:
        break;
    }

  }

  checkSelected() {
    return true;
  }

  signalSelectAll() {
    this.customMaterialService.selectAll.next(this.isAllSelected);
  }


  delete() {
    this.customMaterialService.getSelected.next(true);
  }

  export() {
    this.customMaterialService.getSelected.next(true);
    this.selectedMaterialData = this.customMaterialService.buildSelectedData();
    this.showExportModal();
  }

  exportData(){
    this.importExportService.downloadMaterialData(this.selectedMaterialData);
  }

  showExportModal(){
    this.exportModalOpen = true;
    this.exportModal.show();
  }

  hideExportModal(){
    this.exportModalOpen = false;
    this.exportModal.hide();
  }


  setImportFile($event) {
    if ($event.target.files) {
      if ($event.target.files.length != 0) {
        let regex = /.json$/;
        if (regex.test($event.target.files[0].name)) {
          this.fileReference = $event;
          this.isValidFile = true;
        } else {
          this.isValidFile = false;
        }
      }
    }
  }


  showImportModal(){
    this.importModal.show();
  }

  hideImportModal(){
    this.importModal.hide();
  }

  importFile() {
    let fr: FileReader = new FileReader();
    fr.readAsText(this.fileReference.target.files[0]);
    fr.onloadend = (e) => {
      let importJson = JSON.parse(fr.result);
      delete importJson.origin;
      this.importing = true;
      this.customMaterialService.importSelected(importJson);
      setTimeout(() => {
        this.importing = false;
        this.hideImportModal();
      }, 1500)
    }
  }
}
