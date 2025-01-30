import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { CompressedAirItem, CompressorTypeOptions, NameplateDataOptions } from '../../../compressed-air-inventory';
import { NameplateDataCatalogService } from './nameplate-data-catalog.service';
import { CompressedAirCatalogService } from '../compressed-air-catalog.service';
import { CompressedAirInventoryService } from '../../../compressed-air-inventory.service';
@Component({
  selector: 'app-nameplate-data-catalog',
  templateUrl: './nameplate-data-catalog.component.html',
  styleUrl: './nameplate-data-catalog.component.css'
})
export class NameplateDataCatalogComponent implements OnInit {
  settingsSub: Subscription;
  settings: Settings;

  form: FormGroup;
  selectedCompressedAirItemSub: Subscription;
  displayOptions: NameplateDataOptions;
  displayForm: boolean = true;

  compressorTypeOptions: Array<{ value: number, label: string }> = CompressorTypeOptions;
  invalidCompressorType: boolean;
  
  constructor(private compressedAirCatalogService: CompressedAirCatalogService, private compressedAirInventoryService: CompressedAirInventoryService,
    private nameplateDataCatalogService: NameplateDataCatalogService) { }

  ngOnInit(): void {
    this.settingsSub = this.compressedAirInventoryService.settings.subscribe(val => {
      this.settings = val;
    });
    this.selectedCompressedAirItemSub = this.compressedAirCatalogService.selectedCompressedAirItem.subscribe(selectedCompressedAir => {
      if (selectedCompressedAir) {
        this.form = this.nameplateDataCatalogService.getFormFromNameplateData(selectedCompressedAir.nameplateData);
      }
    });
    this.displayOptions = this.compressedAirInventoryService.compressedAirInventoryData.getValue().displayOptions.nameplateDataOptions;
  }

  ngOnDestroy() {
    this.selectedCompressedAirItemSub.unsubscribe();
    this.settingsSub.unsubscribe();
  }

  save() {
    let selectedCompressedAir: CompressedAirItem = this.compressedAirCatalogService.selectedCompressedAirItem.getValue();
    selectedCompressedAir.nameplateData = this.nameplateDataCatalogService.updateNameplateDataFromForm(this.form, selectedCompressedAir.nameplateData);
    this.compressedAirInventoryService.updateCompressedAirItem(selectedCompressedAir);
  }

  focusField(str: string) {
    this.compressedAirInventoryService.focusedDataGroup.next('nameplate-data');
    this.compressedAirInventoryService.focusedField.next(str);
  }

  toggleForm() {
    this.displayForm = !this.displayForm;
  }

}
