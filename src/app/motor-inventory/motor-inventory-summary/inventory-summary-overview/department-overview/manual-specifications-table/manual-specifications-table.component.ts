import { Component, OnInit, Input } from '@angular/core';
import { MotorPropertyDisplayOptions, MotorInventoryDepartment } from '../../../../motor-inventory';
@Component({
  selector: 'app-manual-specifications-table',
  templateUrl: './manual-specifications-table.component.html',
  styleUrls: ['./manual-specifications-table.component.css']
})
export class ManualSpecificationsTableComponent implements OnInit {
  @Input()
  department: MotorInventoryDepartment;
  @Input()
  displayOptions: MotorPropertyDisplayOptions;
  constructor() { }

  ngOnInit(): void {
  }

}
