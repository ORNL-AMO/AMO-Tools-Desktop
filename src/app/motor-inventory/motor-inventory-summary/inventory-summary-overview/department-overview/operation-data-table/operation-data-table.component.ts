import { Component, OnInit, Input } from '@angular/core';
import { MotorPropertyDisplayOptions, MotorInventoryDepartment } from '../../../../motor-inventory';

@Component({
  selector: 'app-operation-data-table',
  templateUrl: './operation-data-table.component.html',
  styleUrls: ['./operation-data-table.component.css']
})
export class OperationDataTableComponent implements OnInit {
  @Input()
  department: MotorInventoryDepartment;
  @Input()
  displayOptions: MotorPropertyDisplayOptions;
  constructor() { }

  ngOnInit(): void {
  }

}
