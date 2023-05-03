import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { fluidTypes } from '../../../../psat/psatConstants';
import { Settings } from '../../../../shared/models/settings';
import { FluidPropertiesOptions, PumpItem } from '../../../pump-inventory';
import { PumpInventoryService } from '../../../pump-inventory.service';
import { PumpCatalogService } from '../pump-catalog.service';
import { FluidCatalogService } from './fluid-catalog.service';

@Component({
  selector: 'app-fluid-catalog',
  templateUrl: './fluid-catalog.component.html',
  styleUrls: ['./fluid-catalog.component.css']
})
export class FluidCatalogComponent implements OnInit {
  settingsSub: Subscription;
  settings: Settings;
  
  form: FormGroup;
  selectedPumpItemSub: Subscription;
  displayOptions: FluidPropertiesOptions;
  displayForm: boolean = true;

  fluidTypes: Array<string>;
  constructor(private pumpCatalogService: PumpCatalogService, private pumpInventoryService: PumpInventoryService,
    private fluidCatalogService: FluidCatalogService) { }

  ngOnInit(): void {
    this.fluidTypes = fluidTypes;
    this.settingsSub = this.pumpInventoryService.settings.subscribe(val => {
      this.settings = val;
    });
    this.selectedPumpItemSub = this.pumpCatalogService.selectedPumpItem.subscribe(selectedPump => {
      if (selectedPump) {
        this.form = this.fluidCatalogService.getFormFromFluidProperties(selectedPump.fluid);
      }
    });
    this.displayOptions = this.pumpInventoryService.pumpInventoryData.getValue().displayOptions.fluidPropertiesOptions;
  }

  ngOnDestroy() {
    this.selectedPumpItemSub.unsubscribe();
    this.settingsSub.unsubscribe();
  }

  save() {
    let selectedPump: PumpItem = this.pumpCatalogService.selectedPumpItem.getValue();
    selectedPump.fluid = this.fluidCatalogService.updateFluidProprtiesFromForm(this.form, selectedPump.fluid);
    this.pumpInventoryService.updatePumpItem(selectedPump);
  }

  focusField(str: string) {
    this.pumpInventoryService.focusedDataGroup.next('fluid-properties');
    this.pumpInventoryService.focusedField.next(str);
  }

  toggleForm() {
    this.displayForm = !this.displayForm;
  }

}
