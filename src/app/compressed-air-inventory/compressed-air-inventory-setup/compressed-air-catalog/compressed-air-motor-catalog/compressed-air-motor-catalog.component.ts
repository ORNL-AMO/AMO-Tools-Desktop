import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirItem, CompressedAirMotorPropertiesOptions } from '../../../compressed-air-inventory';
import { CompressedAirInventoryService } from '../../../compressed-air-inventory.service';
import { CompressedAirCatalogService } from '../compressed-air-catalog.service';
import { Settings } from '../../../../shared/models/settings';
import { CompressedAirMotorCatalogService } from './compressed-air-motor-catalog.service';

@Component({
  selector: 'app-compressed-air-motor-catalog',
  templateUrl: './compressed-air-motor-catalog.component.html',
  styleUrl: './compressed-air-motor-catalog.component.css',
  standalone: false
})
export class CompressedAirMotorCatalogComponent implements OnInit {
  settingsSub: Subscription;
  settings: Settings;

  form: FormGroup;
  selectedCompressedAirItemSub: Subscription;
  displayOptions: CompressedAirMotorPropertiesOptions;
  displayForm: boolean = true;
 
  
  constructor(private compressedAirCatalogService: CompressedAirCatalogService, private compressedAirInventoryService: CompressedAirInventoryService,
    private compressedAirMotorCatalogService: CompressedAirMotorCatalogService) { }

  ngOnInit(): void {
    this.settingsSub = this.compressedAirInventoryService.settings.subscribe(val => {
      this.settings = val;
    });
    this.selectedCompressedAirItemSub = this.compressedAirCatalogService.selectedCompressedAirItem.subscribe(selectedCompressedAir => {
      if (selectedCompressedAir) {
        this.form = this.compressedAirMotorCatalogService.getFormFromMotorProperties(selectedCompressedAir.compressedAirMotor);
      }
    });
    this.displayOptions = this.compressedAirInventoryService.compressedAirInventoryData.getValue().displayOptions.compressedAirMotorPropertiesOptions;
  }

  ngOnDestroy() {
    this.selectedCompressedAirItemSub.unsubscribe();
    this.settingsSub.unsubscribe();
  }

  save() {
    let selectedCompressedAir: CompressedAirItem = this.compressedAirCatalogService.selectedCompressedAirItem.getValue();
    selectedCompressedAir.compressedAirMotor = this.compressedAirMotorCatalogService.updateMotorPropertiesFromForm(this.form, selectedCompressedAir.compressedAirMotor);
    this.compressedAirInventoryService.updateCompressedAirItem(selectedCompressedAir);
  }

  focusField(str: string) {
    this.compressedAirInventoryService.focusedDataGroup.next('compressed-air-motor');
    this.compressedAirInventoryService.focusedField.next(str);
  }

  toggleForm() {
    this.displayForm = !this.displayForm;
  }

}
