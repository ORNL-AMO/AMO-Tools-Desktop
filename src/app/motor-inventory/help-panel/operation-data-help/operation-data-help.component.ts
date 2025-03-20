import { Component, OnInit } from '@angular/core';
import { MotorInventoryService } from '../../motor-inventory.service';
import { Subscription } from 'rxjs';
import { MotorPropertyDisplayOptions } from '../../motor-inventory';
@Component({
    selector: 'app-operation-data-help',
    templateUrl: './operation-data-help.component.html',
    styleUrls: ['./operation-data-help.component.css'],
    standalone: false
})
export class OperationDataHelpComponent implements OnInit {

  focusedField: string;
  focusedFieldSub: Subscription;
  displayOptions: MotorPropertyDisplayOptions;
  constructor(private motorInventoryService: MotorInventoryService) { }

  ngOnInit(): void {
    this.displayOptions = this.motorInventoryService.motorInventoryData.getValue().displayOptions;
    this.focusedFieldSub = this.motorInventoryService.focusedField.subscribe(val => {
      this.focusedField = val;
    });
  }

  ngOnDestroy(){
    this.focusedFieldSub.unsubscribe();
  }


}
