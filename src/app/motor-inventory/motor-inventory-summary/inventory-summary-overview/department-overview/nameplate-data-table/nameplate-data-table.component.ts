import { Component, OnInit, Input } from '@angular/core';
import { MotorPropertyDisplayOptions, MotorInventoryDepartment } from '../../../../motor-inventory';

@Component({
  selector: 'app-nameplate-data-table',
  templateUrl: './nameplate-data-table.component.html',
  styleUrls: ['./nameplate-data-table.component.css']
})
export class NameplateDataTableComponent implements OnInit {
  @Input()
  department: MotorInventoryDepartment;
  @Input()
  displayOptions: MotorPropertyDisplayOptions;
  constructor() { }

  ngOnInit(): void {
  }

}
