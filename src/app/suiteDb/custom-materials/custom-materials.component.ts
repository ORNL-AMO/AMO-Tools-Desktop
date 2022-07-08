import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { CustomMaterialsService, MaterialData } from './custom-materials.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ImportExportService } from '../../dashboard/import-export/import-export.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';

@Component({
  selector: 'app-custom-materials',
  templateUrl: './custom-materials.component.html',
  styleUrls: ['./custom-materials.component.css']
})
export class CustomMaterialsComponent implements OnInit {


  settings: Settings;

  showFlueModal: boolean = false;
  showSolidLiquidFlueModal: boolean = false;
  showGasLoadChargeModal: boolean = false;
  showLiquidLoadChargeModal: boolean = false;
  showSolidLoadChargeModal: boolean = false;
  showAtmosphereModal: boolean = false;
  showWallSurfaceModal: boolean = false;

  showFlueMaterials: boolean = true;
  showSolidLiquidFlueMaterials: boolean = true;
  showGasLoadChargeMaterials: boolean = true;
  showLiquidLoadChargeMaterials: boolean = true;
  showSolidLoadChargeMaterials: boolean = true;
  showAtmosphereMaterials: boolean = true;
  showWallSurfaceMaterials: boolean = true;

  hasFlueMaterials: boolean = false;
  hasSolidLiquidFlueMaterials: boolean = false;
  hasGasLoadChargeMaterials: boolean = false;
  hasLiquidLoadChargeMaterials: boolean = false;
  hasSolidLoadChargeMaterials: boolean = false;
  hasAtmosphereMaterials: boolean = false;
  hasWallSurfaceMaterials: boolean = false;

  isAllSelected: boolean = false;
  deleteModalOpen: boolean = false;
  @ViewChild('exportModal', { static: false }) public exportModal: ModalDirective;
  @ViewChild('importModal', { static: false }) public importModal: ModalDirective;
  @ViewChild('deleteModal', { static: false }) public deleteModal: ModalDirective;
  selectedMaterialData: MaterialData;
  exportModalOpen: boolean = false;
  fileReference: any;
  isValidFile: boolean;
  importing: boolean = false;
  exportName: string;

  importFileError: string;
  constructor(private customMaterialService: CustomMaterialsService, private importExportService: ImportExportService, private settingsDbService: SettingsDbService) { }

  ngOnInit() {
    this.settings = this.settingsDbService.globalSettings;
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
        this.showFlueMaterials = !this.showFlueMaterials || !this.hasFlueMaterials;
        break;
      case 'solid-liquid-flue':
        this.showSolidLiquidFlueMaterials = !this.showSolidLiquidFlueMaterials || !this.hasSolidLiquidFlueMaterials;
        break;
      case 'gas-load':
        this.showGasLoadChargeMaterials = !this.showGasLoadChargeMaterials || !this.hasGasLoadChargeMaterials;
        break;
      case 'liquid-load':
        this.showLiquidLoadChargeMaterials = !this.showLiquidLoadChargeMaterials || !this.hasLiquidLoadChargeMaterials;
        break;
      case 'solid-load':
        this.showSolidLoadChargeMaterials = !this.showSolidLoadChargeMaterials || !this.hasSolidLoadChargeMaterials;
        break;
      case 'atmosphere-material':
        this.showAtmosphereMaterials = !this.showAtmosphereMaterials || !this.hasAtmosphereMaterials;
        break;
      case 'wall-surface':
        this.showWallSurfaceMaterials = !this.showWallSurfaceMaterials || !this.hasWallSurfaceMaterials;
        break;
      default:
        break;
    }

  }

  checkSelected() {
    this.customMaterialService.getSelected.next(true);
    let test = this.customMaterialService.buildSelectedData();
    if (
      test.atmosphereSpecificHeat.length !== 0 ||
      test.flueGasMaterial.length !== 0 ||
      test.gasLoadChargeMaterial.length !== 0 ||
      test.liquidLoadChargeMaterial.length !== 0 ||
      test.solidLiquidFlueGasMaterial.length !== 0 ||
      test.solidLoadChargeMaterial.length !== 0 ||
      test.wallLossesSurface.length !== 0
    ) {
      return true;
    } else {
      return false;
    }
  }

  signalSelectAll() {
    this.customMaterialService.selectAll.next(this.isAllSelected);
  }


  deleteData() {
    this.customMaterialService.deleteSelected(this.selectedMaterialData);
    this.importing = true;
    setTimeout(() => {
      this.importing = false;
      this.hideDeleteModal();
    }, 1500);
  }

  delete() {
    this.customMaterialService.getSelected.next(true);
    this.selectedMaterialData = this.customMaterialService.buildSelectedData();
    this.showDeleteModal();
  }

  showDeleteModal() {
    this.deleteModalOpen = true;
    this.deleteModal.show();
  }

  hideDeleteModal() {
    this.deleteModalOpen = false;
    this.deleteModal.hide();
  }

  export() {
    this.customMaterialService.getSelected.next(true);
    this.selectedMaterialData = this.customMaterialService.buildSelectedData();
    this.showExportModal();
  }

  exportData() {
    this.importExportService.downloadMaterialData(this.selectedMaterialData, this.exportName);
    this.hideExportModal();
  }

  showExportModal() {
    this.exportModalOpen = true;
    this.exportModal.show();
  }

  hideExportModal() {
    this.exportModalOpen = false;
    this.exportModal.hide();
  }

  setHasMaterials(propertyKey: string, numMaterials: number) {
    if (propertyKey == 'hasFlueMaterials') {
      this.hasFlueMaterials = (numMaterials > 0);
    } else if (propertyKey == 'hasSolidLiquidFlueMaterials') {
      this.hasSolidLiquidFlueMaterials = (numMaterials > 0);
    } else if (propertyKey == 'hasGasLoadChargeMaterials') {
      this.hasGasLoadChargeMaterials = (numMaterials > 0);
    } else if (propertyKey == 'hasLiquidLoadChargeMaterials') {
      this.hasLiquidLoadChargeMaterials = (numMaterials > 0);
    } else if (propertyKey == 'hasSolidLoadChargeMaterials') {
      this.hasSolidLoadChargeMaterials = (numMaterials > 0);
    } else if (propertyKey == 'hasAtmosphereMaterials') {
      this.hasAtmosphereMaterials = (numMaterials > 0);
    } else if (propertyKey == 'hasWallSurfaceMaterials') {
      this.hasWallSurfaceMaterials = (numMaterials > 0);
    }
  }

  setImportFile($event) {
    this.importFileError = null;
    if ($event.target.files) {
      if ($event.target.files.length !== 0) {
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


  showImportModal() {
    this.importModal.show();
  }

  hideImportModal() {
    this.importFileError = null;
    this.importModal.hide();
  }

  importFile() {
    const unrecognizedFileError = 'Unrecognized file, please only import files generated by this application.';

    let fr: FileReader = new FileReader();
    fr.onloadend = (e) => {

      if (fr.error) {
        this.importFileError = fr.error.name + ': ' + fr.error.message + '<br>Please report this error to the development team. (See the "Feedback" page for contact information.)';
        return;
      }
      else if (!fr.result || typeof fr.result !== 'string') {
        this.importFileError = 'Unable to read file.';
        return;
      }

      let importJson: any;
      try {
        importJson = JSON.parse(fr.result);
      }
      catch (err) {
        this.importFileError = unrecognizedFileError; // If a non-JSON-encoded file is provided
        return;
      }

      if (importJson.origin) {
        if (importJson.origin === 'AMO-TOOLS-DESKTOP-MATERIALS') {
          this.importFileError = null;
          delete importJson.origin;
          this.importing = true;
          this.customMaterialService.importSelected(importJson);
          setTimeout(() => {
            this.importing = false;
            this.hideImportModal();
          }, 1500);
        } else if (importJson.origin === 'AMO-TOOLS-DESKTOP') {
          this.importFileError = 'This file can only be imported in your assessment dashboard. Use this import area for custom materials.';
        } else {
          this.importFileError = unrecognizedFileError;
        }
      }
      else {
        this.importFileError = unrecognizedFileError;
      }
    };
    fr.readAsText(this.fileReference.target.files[0]);
  }
}
