import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { LoadCharacteristicOptions, MotorItem } from '../../../motor-inventory';
import { MotorCatalogService } from '../motor-catalog.service';
import { MotorInventoryService } from '../../../motor-inventory.service';
import { LoadCharacteristicDataService } from './load-characteristic-data.service';

@Component({
  selector: 'app-load-characteristic-data',
  templateUrl: './load-characteristic-data.component.html',
  styleUrls: ['./load-characteristic-data.component.css']
})
export class LoadCharacteristicDataComponent implements OnInit {

  motorForm: FormGroup;
  selectedMotorItemSub: Subscription;
  displayOptions: LoadCharacteristicOptions;
  displayForm: boolean = true;
  constructor(private motorCatalogService: MotorCatalogService, private motorInventoryService: MotorInventoryService,
    private loadCharacteristicsDataService: LoadCharacteristicDataService) { }

  ngOnInit(): void {
    this.selectedMotorItemSub = this.motorCatalogService.selectedMotorItem.subscribe(selectedMotor => {
      if (selectedMotor) {
        this.motorForm = this.loadCharacteristicsDataService.getFormFromLoadCharacteristicData(selectedMotor.loadCharacteristicData);
      }
    });
    this.displayOptions = this.motorInventoryService.motorInventoryData.getValue().displayOptions.loadCharactersticOptions;
  }

  ngOnDestroy() {
    this.selectedMotorItemSub.unsubscribe();
  }

  save() {
    let selectedMotor: MotorItem = this.motorCatalogService.selectedMotorItem.getValue();
    selectedMotor.loadCharacteristicData = this.loadCharacteristicsDataService.updateLoadCharacteristicDataFromForm(this.motorForm, selectedMotor.loadCharacteristicData);
    this.motorInventoryService.updateMotorItem(selectedMotor);
  }

  focusField(str: string) {
    this.motorInventoryService.focusedDataGroup.next('load-characteristics')
    this.motorInventoryService.focusedField.next(str);
  }

  toggleForm(){
    this.displayForm = !this.displayForm;
  }

}
