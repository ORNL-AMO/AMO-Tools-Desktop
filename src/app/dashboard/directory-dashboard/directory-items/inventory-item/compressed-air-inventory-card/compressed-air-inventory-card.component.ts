import { Component, Input, OnInit } from '@angular/core';
import { InventoryItem } from '../../../../../shared/models/inventory/inventory';

@Component({
  selector: 'app-compressed-air-inventory-card',
  templateUrl: './compressed-air-inventory-card.component.html',
  styleUrl: './compressed-air-inventory-card.component.css'
})
export class CompressedAirInventoryCardComponent implements OnInit {

  @Input()
  inventoryItem: InventoryItem;

  numberOfDepartments: number;
  numberOfCompressedAir: number = 0;
  paybackThreshold: number;
  numRewind: number = 0;
  numReplaceNow: number = 0;
  numReplaceWhenFail: number = 0;
  showBatchSummary: boolean = false;
  totalEnergyUse: number = 0;
  totalEnergyCost: number = 0;
  constructor() { }

  ngOnInit(): void {
    // this.numberOfDepartments = this.inventoryItem.compressedAirInventoryData.departments.length;
    // this.inventoryItem.compressedAirInventoryData.departments.forEach(department => {
    //   this.numberOfPumps = department.catalog.length;
    // });
  }

}
