import { Component, OnInit, Input } from '@angular/core';
import { OperationDataOptions, OperationData } from '../../../../motor-inventory';

@Component({
    selector: 'app-operations-details',
    templateUrl: './operations-details.component.html',
    styleUrls: ['./operations-details.component.css'],
    standalone: false
})
export class OperationsDetailsComponent implements OnInit {
  @Input()
  displayOptions: OperationDataOptions;
  @Input()
  operationData: OperationData;
  constructor() { }

  ngOnInit(): void {
  }

}
