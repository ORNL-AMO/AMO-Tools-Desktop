import { Component, OnInit } from '@angular/core';
import { CompressedAirCatalogService } from '../compressed-air-catalog.service';
import { CentrifugalSpecificsCatalogService } from './centrifugal-specifics-catalog.service';
import { CompressedAirInventoryService } from '../../../compressed-air-inventory.service';
import { Settings } from '../../../../shared/models/settings';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirItem } from '../../../compressed-air-inventory';

@Component({
  selector: 'app-centrifugal-specifics-catalog',
  templateUrl: './centrifugal-specifics-catalog.component.html',
  styleUrl: './centrifugal-specifics-catalog.component.css'
})
export class CentrifugalSpecificsCatalogComponent implements OnInit {

  settingsSub: Subscription;
  settings: Settings;

  form: UntypedFormGroup;
  selectedCompressedAirItemSub: Subscription;
  //displayOptions: CompressedAirDesignDetailsPropertiesOptions;
  displayForm: boolean = true;
  
  compressorType: number;

  constructor(private compressedAirCatalogService: CompressedAirCatalogService,
    private compressedAirInventoryService: CompressedAirInventoryService,
    private centrifugalSpecificsCatalogService: CentrifugalSpecificsCatalogService) { }

  ngOnInit(): void {
    this.settingsSub = this.compressedAirInventoryService.settings.subscribe(val => {
      this.settings = val;
    });
    this.selectedCompressedAirItemSub = this.compressedAirCatalogService.selectedCompressedAirItem.subscribe(selectedCompressedAir => {
      if (selectedCompressedAir) {
        this.compressorType = selectedCompressedAir.nameplateData.compressorType;
        this.form = this.centrifugalSpecificsCatalogService.getCentrifugalFormFromObj(selectedCompressedAir);
       
      }
    });
    //this.displayOptions = this.compressedAirInventoryService.compressedAirInventoryData.getValue().displayOptions.compressedAirControlsPropertiesOptions;
  }

  ngOnDestroy() {
      this.selectedCompressedAirItemSub.unsubscribe();
      this.settingsSub.unsubscribe();
    }
  
    save() {
      let selectedCompressedAir: CompressedAirItem = this.compressedAirCatalogService.selectedCompressedAirItem.getValue();
      selectedCompressedAir.centrifugalSpecifics = this.centrifugalSpecificsCatalogService.updateCentrifugalFromForm(this.form, selectedCompressedAir.centrifugalSpecifics);
      this.compressedAirInventoryService.updateCompressedAirItem(selectedCompressedAir);
    }
  
    focusField(str: string) {
      this.compressedAirInventoryService.focusedDataGroup.next('centrifugal-specifics');
      this.compressedAirInventoryService.focusedField.next(str);
    }
  
    toggleForm() {
      this.displayForm = !this.displayForm;
    }

}
