import { Component, OnInit, Input } from '@angular/core';
import { MotorInventoryDepartment, MotorPropertyDisplayOptions } from '../../../motor-inventory';

@Component({
  selector: 'app-department-overview',
  templateUrl: './department-overview.component.html',
  styleUrls: ['./department-overview.component.css']
})
export class DepartmentOverviewComponent implements OnInit {
  @Input()
  department: MotorInventoryDepartment;
  @Input()
  displayOptions: MotorPropertyDisplayOptions;


  constructor() { }

  ngOnInit(): void {
  }

}
