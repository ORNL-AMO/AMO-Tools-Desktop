import { Component, OnInit, Input } from '@angular/core';
import { MotorPropertyDisplayOptions, MotorInventoryDepartment } from '../../../../motor-inventory';
@Component({
  selector: 'app-purchase-information-table',
  templateUrl: './purchase-information-table.component.html',
  styleUrls: ['./purchase-information-table.component.css']
})
export class PurchaseInformationTableComponent implements OnInit {
  @Input()
  department: MotorInventoryDepartment;
  @Input()
  displayOptions: MotorPropertyDisplayOptions;
  constructor() { }

  ngOnInit(): void {
  }

}
