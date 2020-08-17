import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { InventoryItem } from '../../../../shared/models/inventory/inventory';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DirectoryDashboardService } from '../../directory-dashboard.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';
import { IndexedDbService } from '../../../../indexedDb/indexed-db.service';
import { InventoryDbService } from '../../../../indexedDb/inventory-db.service';
import { DashboardService } from '../../../dashboard.service';
import { Directory } from '../../../../shared/models/directory';
import * as _ from 'lodash';
import { DirectoryDbService } from '../../../../indexedDb/directory-db.service';
import { SettingsDbService } from '../../../../indexedDb/settings-db.service';
import { Settings } from '../../../../shared/models/settings';

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
  editForm: FormGroup;
  allDirectories: Array<Directory>;

  updateDashboardDataSub: Subscription;

  constructor(private router: Router, private directoryDashboardService: DirectoryDashboardService,
    private formBuilder: FormBuilder, private indexedDbService: IndexedDbService, private inventoryDbService: InventoryDbService,
    private dashboardService: DashboardService, private directoryDbService: DirectoryDbService, private settingsDbService: SettingsDbService) { }

  ngOnInit(): void {
    this.dashboardViewSub = this.directoryDashboardService.dashboardView.subscribe(val => {
      this.dashboardView = val;
    });
    this.updateDashboardDataSub = this.dashboardService.updateDashboardData.subscribe(val => {
      this.allDirectories = this.directoryDbService.getAll();
    });
  }

  ngOnDestroy() {
    this.dashboardViewSub.unsubscribe();
    this.updateDashboardDataSub.unsubscribe();
  }

  goToInventoryItem() {
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

  save() {
    this.inventoryItem.name = this.editForm.controls.name.value;
    this.inventoryItem.directoryId = this.editForm.controls.directoryId.value;
    this.indexedDbService.putInventoryItem(this.inventoryItem).then(val => {
      this.inventoryDbService.setAll().then(() => {
        this.dashboardService.updateDashboardData.next(true);
        this.hideEditModal();
      });
    });
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

  deleteInventory() {
    let deleteSettings: Settings = this.settingsDbService.getByInventoryId(this.inventoryItem);
    this.indexedDbService.deleteInventoryItem(this.inventoryItem.id).then(() => {
      this.indexedDbService.deleteSettings(deleteSettings.id).then(() => {
        this.inventoryDbService.setAll().then(() => {
          this.settingsDbService.setAll().then(() => {
            this.dashboardService.updateDashboardData.next(true);
            this.hideDeleteModal();
          });
        });
      });
    });
  }
}
