import { Component, OnInit } from '@angular/core';
import { PumpInventoryData, SystemProperties, SystemPropertiesOptions } from '../../../pump-inventory';
import { PumpInventoryService } from '../../../pump-inventory.service';

@Component({
  selector: 'app-system-properties',
  templateUrl: './system-properties.component.html',
  styleUrls: ['./system-properties.component.css']
})
export class SystemPropertiesComponent implements OnInit {
  displayForm: boolean;
  systemPropertiesOptions: SystemPropertiesOptions;
  constructor(private pumpInventoryService: PumpInventoryService) { }

  ngOnInit(): void {
    this.systemPropertiesOptions = this.pumpInventoryService.pumpInventoryData.getValue().displayOptions.systemPropertiesOptions;
    this.displayForm = this.systemPropertiesOptions.displaySystemProperties;
  }

  save() {
    let pumpInventoryService: PumpInventoryData = this.pumpInventoryService.pumpInventoryData.getValue();
    this.checkDisplayFields();
    pumpInventoryService.displayOptions.systemPropertiesOptions = this.systemPropertiesOptions;
    this.pumpInventoryService.pumpInventoryData.next(pumpInventoryService);
  }

  toggleForm() {
    this.displayForm = !this.displayForm;
  }

  setAll() {
    this.systemPropertiesOptions.driveType = this.systemPropertiesOptions.displaySystemProperties;
    this.systemPropertiesOptions.flangeConnectionClass = this.systemPropertiesOptions.displaySystemProperties;
    this.systemPropertiesOptions.flangeConnectionSize = this.systemPropertiesOptions.displaySystemProperties;
    this.systemPropertiesOptions.componentId = this.systemPropertiesOptions.displaySystemProperties;    
    this.systemPropertiesOptions.system = this.systemPropertiesOptions.displaySystemProperties;    
    this.systemPropertiesOptions.location = this.systemPropertiesOptions.displaySystemProperties;    
    this.save();
  }

  checkDisplayFields() {
    this.systemPropertiesOptions.displaySystemProperties = (
      this.systemPropertiesOptions.driveType ||
      this.systemPropertiesOptions.flangeConnectionClass ||
      this.systemPropertiesOptions.flangeConnectionSize ||
      this.systemPropertiesOptions.componentId ||
      this.systemPropertiesOptions.location ||
      this.systemPropertiesOptions.system
    );
  }
  focusField(str: string){
    this.focusGroup();
    this.pumpInventoryService.focusedField.next(str);
  }

  focusGroup(){
    this.pumpInventoryService.focusedDataGroup.next('system-properties');
  }
}
