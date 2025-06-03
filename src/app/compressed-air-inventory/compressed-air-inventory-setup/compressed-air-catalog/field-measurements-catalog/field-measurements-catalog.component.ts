import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressorTypeOptions, CompressedAirItem, FieldMeasurementsOptions } from '../../../compressed-air-inventory';
import { CompressedAirInventoryService } from '../../../compressed-air-inventory.service';
import { CompressedAirCatalogService } from '../compressed-air-catalog.service';
import { FieldMeasurementsCatalogService } from './field-measurements-catalog.service';
import { Settings } from '../../../../shared/models/settings';
import { OperatingHours } from '../../../../shared/models/operations';

@Component({
  selector: 'app-field-measurements-catalog',
  templateUrl: './field-measurements-catalog.component.html',
  styleUrl: './field-measurements-catalog.component.css',
  standalone: false
})
export class FieldMeasurementsCatalogComponent implements OnInit {
  settingsSub: Subscription;
  settings: Settings;

  form: FormGroup;
  selectedCompressedAirItemSub: Subscription;
  displayOptions: FieldMeasurementsOptions;
  displayForm: boolean = true;

  compressorTypeOptions: Array<{ value: number, label: string }> = CompressorTypeOptions;
  invalidCompressorType: boolean;

  formWidth: number;
  operatingHours: OperatingHours;

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }

  showOperatingHoursModal: boolean = false;

  constructor(private compressedAirCatalogService: CompressedAirCatalogService, private compressedAirInventoryService: CompressedAirInventoryService,
    private fieldMeasurementsCatalogService: FieldMeasurementsCatalogService) { }

  ngOnInit(): void {
    this.settingsSub = this.compressedAirInventoryService.settings.subscribe(val => {
      this.settings = val;
    });
    this.selectedCompressedAirItemSub = this.compressedAirCatalogService.selectedCompressedAirItem.subscribe(selectedCompressedAir => {
      if (selectedCompressedAir) {
        this.form = this.fieldMeasurementsCatalogService.getFormFromFieldMeasurements(selectedCompressedAir.fieldMeasurements);
      }
    });
    this.displayOptions = this.compressedAirInventoryService.compressedAirInventoryData.getValue().displayOptions.fieldMeasurementsOptions;
  }

  ngOnDestroy() {
    this.selectedCompressedAirItemSub.unsubscribe();
    this.settingsSub.unsubscribe();
  }

  save() {
    let selectedCompressedAir: CompressedAirItem = this.compressedAirCatalogService.selectedCompressedAirItem.getValue();
    selectedCompressedAir.fieldMeasurements = this.fieldMeasurementsCatalogService.updateFieldMeasurementsFromForm(this.form, selectedCompressedAir.fieldMeasurements);
    this.compressedAirInventoryService.updateCompressedAirItem(selectedCompressedAir);
  }

  focusField(str: string) {
    this.compressedAirInventoryService.focusedDataGroup.next('field-measurements');
    this.compressedAirInventoryService.focusedField.next(str);
  }

  toggleForm() {
    this.displayForm = !this.displayForm;
  }

  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
    this.compressedAirInventoryService.modalOpen.next(false);
  }

  openOperatingHoursModal() {
    let selectedCompressedAirItem = this.compressedAirCatalogService.getUpdatedSelectedCompressedAirItem();
    this.operatingHours = selectedCompressedAirItem.fieldMeasurements.operatingHours;
    this.showOperatingHoursModal = true;
    this.compressedAirInventoryService.modalOpen.next(true);
  }

  updateOperatingHours(oppHours: OperatingHours) {
    this.form.controls.yearlyOperatingHours.patchValue(oppHours.hoursPerYear);
    let selectedCompressedAir: CompressedAirItem = this.compressedAirCatalogService.selectedCompressedAirItem.getValue();
    selectedCompressedAir.fieldMeasurements.operatingHours = oppHours;
    this.save();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth() {
    if (this.formElement && this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }

}