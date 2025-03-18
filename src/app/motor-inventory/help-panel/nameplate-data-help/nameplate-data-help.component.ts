import { Component, OnInit } from '@angular/core';
import { MotorInventoryService } from '../../motor-inventory.service';
import { Subscription } from 'rxjs';
import { Settings } from '../../../shared/models/settings';
import { MotorPropertyDisplayOptions } from '../../motor-inventory';
@Component({
    selector: 'app-nameplate-data-help',
    templateUrl: './nameplate-data-help.component.html',
    styleUrls: ['./nameplate-data-help.component.css'],
    standalone: false
})
export class NameplateDataHelpComponent implements OnInit {

  focusedField: string;
  focusedFieldSub: Subscription;
  settings: Settings;
  displayOptions: MotorPropertyDisplayOptions;
  constructor(private motorInventoryService: MotorInventoryService) { }

  ngOnInit(): void {
    this.displayOptions = this.motorInventoryService.motorInventoryData.getValue().displayOptions;
    this.settings = this.motorInventoryService.settings.getValue();
    this.focusedFieldSub = this.motorInventoryService.focusedField.subscribe(val => {
      this.focusedField = val;
    });
  }

  ngOnDestroy(){
    this.focusedFieldSub.unsubscribe();
  }

}
