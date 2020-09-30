import { Component, OnInit, Input } from '@angular/core';
import { InventoryItem } from '../../../shared/models/inventory/inventory';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inventory-item',
  templateUrl: './inventory-item.component.html',
  styleUrls: ['./inventory-item.component.css']
})
export class InventoryItemComponent implements OnInit {
  @Input()
  inventoryItem: InventoryItem;

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  goToInventoryItem() {
    this.router.navigateByUrl('/motor-inventory/' + this.inventoryItem.id);
  }
}
