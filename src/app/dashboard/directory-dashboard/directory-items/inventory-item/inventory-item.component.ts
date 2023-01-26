import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { InventoryItem } from '../../../../shared/models/inventory/inventory';
import { Router } from '@angular/router';
import { firstValueFrom, Subscription } from 'rxjs';
import { DirectoryDashboardService } from '../../directory-dashboard.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
 
import { InventoryDbService } from '../../../../indexedDb/inventory-db.service';
import { DashboardService } from '../../../dashboard.service';
import { Directory } from '../../../../shared/models/directory';
import * as _ from 'lodash';
import { DirectoryDbService } from '../../../../indexedDb/directory-db.service';
import { SettingsDbService } from '../../../../indexedDb/settings-db.service';
import { Settings } from '../../../../shared/models/settings';
import { MotorInventoryService } from '../../../../motor-inventory/motor-inventory.service';

@Component({
  selector: 'app-inventory-item',
  templateUrl: './inventory-item.component.html',
  styleUrls: ['./inventory-item.component.css']
})
export class InventoryItemComponent implements OnInit {
  @Input()
  inventoryItem: InventoryItem;

  @ViewChild('editModal', { static: false }) public editModal: ModalDirective;
  @ViewChild('copyModal', { static: false }) public copyModal: ModalDirective;
  @ViewChild('deleteModal', { static: false }) public deleteModal: ModalDirective;

  dropdownOpen: boolean = false;
  dashboardViewSub: Subscription;
  dashboardView: string;
  editForm: UntypedFormGroup;
  copyForm: UntypedFormGroup;
  allDirectories: Array<Directory>;

  updateDashboardDataSub: Subscription;

  constructor(private router: Router, private directoryDashboardService: DirectoryDashboardService,
    private formBuilder: UntypedFormBuilder,    private inventoryDbService: InventoryDbService,
    private dashboardService: DashboardService, private directoryDbService: DirectoryDbService, private settingsDbService: SettingsDbService,
    private motorInventoryService: MotorInventoryService) { }

  ngOnInit(): void {
    this.dashboardViewSub = this.directoryDashboardService.dashboardView.subscribe(val => {
      this.dashboardView = val;
    });
    this.updateDashboardDataSub = this.dashboardService.updateDashboardData.subscribe(val => {
      this.setDirectories();
    });
  }

  ngOnDestroy() {
    this.dashboardViewSub.unsubscribe();
    this.updateDashboardDataSub.unsubscribe();
  }

  async setDirectories() {
    this.allDirectories = await firstValueFrom(this.directoryDbService.getAllDirectories());
  }

  goToInventoryItem(inventoryPage?: string) {
    if (inventoryPage) {
      this.motorInventoryService.mainTab.next(inventoryPage);
    }
    this.router.navigateByUrl('/motor-inventory/' + this.inventoryItem.id);
  }

  showDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  showEditModal() {
    this.editForm = this.formBuilder.group({
      'name': [this.inventoryItem.name, Validators.required],
      'directoryId': [this.inventoryItem.directoryId, Validators.required]
    });
    this.editModal.show();
  }

  hideEditModal() {
    this.editModal.hide();
  }

  async save() {
    this.inventoryItem.name = this.editForm.controls.name.value;
    this.directoryDbService.setIsMovedExample(this.inventoryItem, this.editForm);
    this.inventoryItem.directoryId = this.editForm.controls.directoryId.value;
    let updatedInventoryItems: InventoryItem[] = await firstValueFrom(this.inventoryDbService.updateWithObservable(this.inventoryItem));
    this.inventoryDbService.setAll(updatedInventoryItems);
    this.dashboardService.updateDashboardData.next(true);
    this.hideEditModal();

  }

  getParentDirStr(id: number) {
    let parentDir = _.find(this.allDirectories, (dir) => { return dir.id === id; });
    let str = parentDir.name + '/';
    while (parentDir.parentDirectoryId) {
      parentDir = _.find(this.allDirectories, (dir) => { return dir.id === parentDir.parentDirectoryId; });
      str = parentDir.name + '/' + str;
    }
    return str;
  }

  showDeleteModal() {
    this.deleteModal.show();
  }

  hideDeleteModal() {
    this.deleteModal.hide();
  }

  async deleteInventory() {
    let deleteSettings: Settings = this.settingsDbService.getByInventoryId(this.inventoryItem);
    let updatedInventoryItems: InventoryItem[] = await firstValueFrom(this.inventoryDbService.deleteByIdWithObservable(this.inventoryItem.id));
    let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.deleteByIdWithObservable(deleteSettings.id));
    this.inventoryDbService.setAll(updatedInventoryItems);
    this.settingsDbService.setAll(updatedSettings);
    this.dashboardService.updateDashboardData.next(true);
    this.hideDeleteModal();
  }

  showCopyModal() {
    this.copyForm = this.formBuilder.group({
      'name': [this.inventoryItem.name + ' (copy)', Validators.required],
      'directoryId': [this.inventoryItem.directoryId, Validators.required],
    });
    this.copyModal.show();
  }

  hideCopyModal() {
    this.copyModal.hide();
  }

  async createCopy() {
    let inventoryCopy: InventoryItem = JSON.parse(JSON.stringify(this.inventoryItem));
    delete inventoryCopy.id;
    let tmpSettings: Settings = this.settingsDbService.getByInventoryId(this.inventoryItem);
    let settingsCopy: Settings = JSON.parse(JSON.stringify(tmpSettings));
    delete settingsCopy.id;
    inventoryCopy.name = this.copyForm.controls.name.value;
    inventoryCopy.directoryId = this.copyForm.controls.directoryId.value;

    let newInventory: InventoryItem = await firstValueFrom(this.inventoryDbService.addWithObservable(inventoryCopy));
    settingsCopy.inventoryId = newInventory.id;
    await firstValueFrom(this.settingsDbService.addWithObservable(settingsCopy));

    let updatedInventories: InventoryItem[] = await firstValueFrom(this.inventoryDbService.getAllInventory());
    let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.getAllSettings());
    this.inventoryDbService.setAll(updatedInventories);
    this.settingsDbService.setAll(updatedSettings);
    this.dashboardService.updateDashboardData.next(true);
    this.hideCopyModal();
  }

}
