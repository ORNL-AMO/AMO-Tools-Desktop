import { Component, OnInit } from '@angular/core';
import { NameplateDataOptions, MotorInventoryData } from '../../../motor-inventory';
import { MotorInventoryService } from '../../../motor-inventory.service';

@Component({
  selector: 'app-nameplate-data-properties',
  templateUrl: './nameplate-data-properties.component.html',
  styleUrls: ['./nameplate-data-properties.component.css']
})
export class NameplateDataPropertiesComponent implements OnInit {

  displayForm: boolean = true;
  nameplateDataOptions: NameplateDataOptions;
  constructor(private motorInventoryService: MotorInventoryService) { }

  ngOnInit(): void {
    this.nameplateDataOptions = this.motorInventoryService.motorInventoryData.getValue().displayOptions.nameplateDataOptions;
  }


  save() {
    let motorInventoryData: MotorInventoryData = this.motorInventoryService.motorInventoryData.getValue();
    motorInventoryData.displayOptions.nameplateDataOptions = this.nameplateDataOptions;
    this.motorInventoryService.motorInventoryData.next(motorInventoryData);
  }

  toggleForm(){
    this.displayForm = !this.displayForm;
  }  
}
