import { Component, OnInit, Input } from '@angular/core';
import { MotorPropertyDisplayOptions, MotorInventoryDepartment } from '../../../../motor-inventory';
@Component({
  selector: 'app-batch-analysis-table',
  templateUrl: './batch-analysis-table.component.html',
  styleUrls: ['./batch-analysis-table.component.css']
})
export class BatchAnalysisTableComponent implements OnInit {
  @Input()
  department: MotorInventoryDepartment;
  @Input()
  displayOptions: MotorPropertyDisplayOptions;
  constructor() { }

  ngOnInit(): void {
  }

}
