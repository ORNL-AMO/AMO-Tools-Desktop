import { Component, OnInit, Input } from '@angular/core';
import { ManualSpecificationData, ManualSpecificationOptions } from '../../../../motor-inventory';

@Component({
    selector: 'app-manual-specifications-details',
    templateUrl: './manual-specifications-details.component.html',
    styleUrls: ['./manual-specifications-details.component.css'],
    standalone: false
})
export class ManualSpecificationsDetailsComponent implements OnInit {
  @Input()
  manualSpecificationData: ManualSpecificationData;
  @Input()
  displayOptions: ManualSpecificationOptions;
  
  constructor() { }

  ngOnInit(): void {
  }

}
