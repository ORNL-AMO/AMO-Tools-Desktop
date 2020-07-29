import { Component, OnInit, Input } from '@angular/core';
import { MotorPropertyDisplayOptions, MotorInventoryDepartment } from '../../../../motor-inventory';
@Component({
  selector: 'app-load-characteristics-table',
  templateUrl: './load-characteristics-table.component.html',
  styleUrls: ['./load-characteristics-table.component.css']
})
export class LoadCharacteristicsTableComponent implements OnInit {
  @Input()
  department: MotorInventoryDepartment;
  @Input()
  displayOptions: MotorPropertyDisplayOptions;
  constructor() { }

  ngOnInit(): void {
  }

}
