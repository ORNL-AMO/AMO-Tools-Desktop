import { Component, OnInit, Input } from '@angular/core';
import { PurchaseInformationOptions, PurchaseInformationData } from '../../../../motor-inventory';

@Component({
  selector: 'app-purchase-info-details',
  templateUrl: './purchase-info-details.component.html',
  styleUrls: ['./purchase-info-details.component.css']
})
export class PurchaseInfoDetailsComponent implements OnInit {
  @Input()
  displayOptions: PurchaseInformationOptions;
  @Input()
  purchaseInformationData: PurchaseInformationData;
  constructor() { }

  ngOnInit(): void {
  }

}
