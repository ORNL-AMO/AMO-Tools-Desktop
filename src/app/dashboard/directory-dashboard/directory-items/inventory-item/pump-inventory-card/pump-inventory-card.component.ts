import { Component, Input, OnInit } from '@angular/core';
import { SettingsDbService } from '../../../../../indexedDb/settings-db.service';
import { InventoryItem } from '../../../../../shared/models/inventory/inventory';
import { Settings } from '../../../../../shared/models/settings';

@Component({
  selector: 'app-pump-inventory-card',
  templateUrl: './pump-inventory-card.component.html',
  styleUrls: ['./pump-inventory-card.component.css']
})
export class PumpInventoryCardComponent implements OnInit {
  @Input()
  inventoryItem: InventoryItem;

  numberOfDepartments: number;
  numberOfPumps: number = 0;
  paybackThreshold: number;
  numRewind: number = 0;
  numReplaceNow: number = 0;
  numReplaceWhenFail: number = 0;
  showBatchSummary: boolean = false;
  totalEnergyUse: number = 0;
  totalEnergyCost: number = 0;
  constructor() { }

  ngOnInit(): void {
    this.numberOfDepartments = this.inventoryItem.pumpInventoryData.departments.length;
    this.inventoryItem.pumpInventoryData.departments.forEach(department => {
      this.numberOfPumps = department.catalog.length;
    });
  }

}
