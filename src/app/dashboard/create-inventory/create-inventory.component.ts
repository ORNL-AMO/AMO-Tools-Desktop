import { Component, OnInit, ViewChild } from '@angular/core';
import { Directory } from '../../shared/models/directory';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Settings } from '../../shared/models/settings';
import { Router } from '@angular/router';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { DashboardService } from '../dashboard.service';
import { InventoryDbService } from '../../indexedDb/inventory-db.service';
import { DirectoryDashboardService } from '../directory-dashboard/directory-dashboard.service';
import { InventoryService } from '../inventory.service';
import { InventoryItem } from '../../shared/models/inventory/inventory';
import * as _ from 'lodash';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { SettingsService } from '../../settings/settings.service';
import { MotorInventoryService } from '../../motor-inventory/motor-inventory.service';
import { firstValueFrom } from 'rxjs';
@Component({
  selector: 'app-create-inventory',
  templateUrl: './create-inventory.component.html',
  styleUrls: ['./create-inventory.component.css']
})
export class CreateInventoryComponent implements OnInit {

  @ViewChild('createInventoryItemModal', { static: false }) public createInventoryItemModal: ModalDirective;
  newInventoryItemForm: FormGroup;
  canCreate: boolean;
  directories: Array<Directory>;
  showNewFolder: boolean = false;
  newFolderForm: FormGroup;
  directory: Directory;
  settings: Settings;
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private indexedDbService: IndexedDbService,
    private settingsDbService: SettingsDbService,
    private directoryDbService: DirectoryDbService,
    private directoryDashboardService: DirectoryDashboardService,
    private dashboardService: DashboardService,
    private inventoryDbService: InventoryDbService,
    private inventoryService: InventoryService,
    private settingsService: SettingsService,
    private motorInventoryService: MotorInventoryService) { }

  ngOnInit() {
    this.setDirectories();
    let directoryId: number = this.directoryDashboardService.selectedDirectoryId.getValue();
    this.directory = this.directoryDbService.getById(directoryId);
    this.settings = this.settingsDbService.getByDirectoryId(directoryId);
    this.newInventoryItemForm = this.initForm();
    this.newFolderForm = this.initFolderForm();
    this.canCreate = true;
  }

  ngAfterViewInit() {
    this.showCreateModal();
  }

  async setDirectories() {
    this.directories = await firstValueFrom(this.directoryDbService.getAllDirectories());
  }

  initForm() {
    return this.formBuilder.group({
      'inventoryName': ['New Motor Inventory', Validators.required],
      'inventoryType': ['motorInventory', Validators.required],
      'directoryId': [this.directory.id, Validators.required]
    });
  }

  //  CREATE inventory MODAL
  showCreateModal() {
    this.createInventoryItemModal.show();
  }

  hideCreateModal() {
    this.createInventoryItemModal.hide();
    this.dashboardService.createInventory.next(false);
  }

  create() {
    if (this.newInventoryItemForm.valid && this.canCreate) {
      this.canCreate = false;
      this.hideCreateModal();
      this.createInventoryItemModal.onHidden.subscribe(() => {
        if (this.newInventoryItemForm.controls.inventoryType.value === 'motorInventory') {
          this.motorInventoryService.mainTab.next('setup');
          this.motorInventoryService.setupTab.next('plant-setup');
          let tmpInventoryItem: InventoryItem = this.inventoryService.getNewMotorInventoryItem();
          tmpInventoryItem.name = this.newInventoryItemForm.controls.inventoryName.value;
          tmpInventoryItem.directoryId = this.newInventoryItemForm.controls.directoryId.value;
          this.indexedDbService.addInventoryItem(tmpInventoryItem).then(itemId => {
            this.inventoryDbService.setAll().then(() => {
              let settingsForm = this.settingsService.getFormFromSettings(this.settings);
              this.settings = this.settingsService.getSettingsFromForm(settingsForm);
              this.settings.createdDate = new Date();
              this.settings.modifiedDate = new Date();
              this.settings.inventoryId = itemId;
              this.indexedDbService.addSettings(this.settings).then(settingsId => {
                this.settingsDbService.setAll().then(() => {
                  this.router.navigateByUrl('/motor-inventory/' + itemId);
                })
              });
            });
          });
        }
      });
    }
  }

  getParentDirStr(id: number) {
    let parentDir = _.find(this.directories, (dir) => { return dir.id === id; });
    if (parentDir) {
      let str = parentDir.name + '/';
      while (parentDir.parentDirectoryId) {
        parentDir = _.find(this.directories, (dir) => { return dir.id === parentDir.parentDirectoryId; });
        str = parentDir.name + '/' + str;
      }
      return str;
    } else {
      return '';
    }
  }

  addFolder() {
    this.showNewFolder = true;
  }

  cancelNewFolder() {
    this.showNewFolder = false;
  }

  createFolder() {
    let tmpFolder: Directory = {
      name: this.newFolderForm.controls.folderName.value,
      parentDirectoryId: this.newFolderForm.controls.directoryId.value
    };
    let tmpSettings: Settings = this.settingsDbService.getByDirectoryId(this.newFolderForm.controls.directoryId.value);
    delete tmpSettings.facilityInfo;
    delete tmpSettings.id;
    if (this.newFolderForm.controls.companyName.value || this.newFolderForm.controls.facilityName.value) {
      tmpSettings.facilityInfo = {
        companyName: this.newFolderForm.controls.companyName.value,
        facilityName: this.newFolderForm.controls.facilityName.value,
        date: new Date().toLocaleDateString()
      };
    }
    this.indexedDbService.addDirectory(tmpFolder).then((newDirId) => {
      tmpSettings.directoryId = newDirId;
      this.directoryDbService.setAll().then(() => {
        this.indexedDbService.addSettings(tmpSettings).then(() => {
          this.settingsDbService.setAll().then(() => {
            this.setDirectories();
            this.newInventoryItemForm.patchValue({
              'directoryId': newDirId
            });
            this.cancelNewFolder();
          });
        });
      });
    });
  }

  initFolderForm() {
    return this.formBuilder.group({
      'folderName': ['', Validators.required],
      'companyName': [''],
      'facilityName': [''],
      'directoryId': [this.directory.id, Validators.required]
    });
  }
}
