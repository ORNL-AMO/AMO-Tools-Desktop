import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { MotorDriveOutputs } from '../motor-drive.component';

@Component({
  selector: 'app-motor-drive-table',
  templateUrl: './motor-drive-table.component.html',
  styleUrls: ['./motor-drive-table.component.css']
})
export class MotorDriveTableComponent implements OnInit {
  @Input()
  results: MotorDriveOutputs;

  @ViewChild('copyTable') copyTable: ElementRef;
  tableString: any;

  constructor() { }

  ngOnInit() {
  }

  updateTableString() {
    this.tableString = this.copyTable.nativeElement.innerText;
  }
}
