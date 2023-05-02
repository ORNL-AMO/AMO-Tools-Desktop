import { Component, OnInit, ViewChild } from '@angular/core';
import { Directory } from '../../shared/models/directory';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Settings } from '../../shared/models/settings';
import { Router } from '@angular/router';
 
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
  newInventoryItemForm: UntypedFormGroup;
  canCreate: boolean;
  directories: Array<Directory>;
  showNewFolder: boolean = false;
  newFolderForm: UntypedFormGroup;
  directory: Directory;
  settings: Settings;
  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
      
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

  async create() {
    if (this.newInventoryItemForm.valid && this.canCreate) {
      this.canCreate = false;
      this.hideCreateModal();
      this.createInventoryItemModal.onHidden.subscribe(async () => {
        if (this.newInventoryItemForm.controls.inventoryType.value === 'motorInventory') {
          this.motorInventoryService.mainTab.next('setup');
          this.motorInventoryService.setupTab.next('plant-setup');
          let tmpInventoryItem: InventoryItem = this.inventoryService.getNewMotorInventoryItem();
          tmpInventoryItem.name = this.newInventoryItemForm.controls.inventoryName.value;
          tmpInventoryItem.directoryId = this.newInventoryItemForm.controls.directoryId.value;


          let newInventory: InventoryItem = await firstValueFrom(this.inventoryDbService.addWithObservable(tmpInventoryItem));
          let settingsForm = this.settingsService.getFormFromSettings(this.settings);
          this.settings = this.settingsService.getSettingsFromForm(settingsForm);
          this.settings.createdDate = new Date();
          this.settings.modifiedDate = new Date();
          this.settings.inventoryId = newInventory.id;
          await firstValueFrom(this.settingsDbService.addWithObservable(this.settings));

          let updatedInventories: InventoryItem[] = await firstValueFrom(this.inventoryDbService.getAllInventory());
          let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.getAllSettings());
          this.inventoryDbService.setAll(updatedInventories);
          this.settingsDbService.setAll(updatedSettings);
          this.dashboardService.navigateWithSidebarOptions('/motor-inventory/' + newInventory.id, {shouldCollapse: true})
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

  async createFolder() {
    let newDirectoryId: number = await this.directoryDashboardService.addDirectoryAndSettings(this.newFolderForm);
    this.setDirectories();
    this.newFolderForm.patchValue({
      'directoryId': newDirectoryId
    });
    this.cancelNewFolder();
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
