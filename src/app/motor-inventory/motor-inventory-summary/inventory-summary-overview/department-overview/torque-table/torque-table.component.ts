import { Component, OnInit, Input } from '@angular/core';
import { MotorPropertyDisplayOptions, MotorInventoryDepartment } from '../../../../motor-inventory';

@Component({
  selector: 'app-torque-table',
  templateUrl: './torque-table.component.html',
  styleUrls: ['./torque-table.component.css']
})
export class TorqueTableComponent implements OnInit {
  @Input()
  department: MotorInventoryDepartment;
  @Input()
  displayOptions: MotorPropertyDisplayOptions;

  constructor() { }

  ngOnInit(): void {
  }

}
