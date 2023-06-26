import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { OperatingHours } from '../../../../shared/models/operations';
import { Settings } from '../../../../shared/models/settings';
import { FieldMeasurementsOptions, PumpInventoryFieldWarnings, PumpItem } from '../../../pump-inventory';
import { PumpInventoryService } from '../../../pump-inventory.service';
import { PumpCatalogService } from '../pump-catalog.service';
import { FieldMeasurementsCatalogService } from './field-measurements-catalog.service';

@Component({
  selector: 'app-field-measurements-catalog',
  templateUrl: './field-measurements-catalog.component.html',
  styleUrls: ['./field-measurements-catalog.component.css']
})
export class FieldMeasurementsCatalogComponent implements OnInit {


  settingsSub: Subscription;
  settings: Settings;
  
  form: FormGroup;
  selectedPumpItemSub: Subscription;
  displayOptions: FieldMeasurementsOptions;
  displayForm: boolean = true;
  formWidth: number;
  operatingHours: OperatingHours;

  loadEstimateMethods: Array<{ display: string, value: number }> = [
    {
      display: 'Power',
      value: 0
    },
    {
      display: 'Current',
      value: 1
    }
  ];

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }
  
  showOperatingHoursModal: boolean = false;
  fieldDataWarnings: PumpInventoryFieldWarnings;

  constructor(private pumpCatalogService: PumpCatalogService, private pumpInventoryService: PumpInventoryService,
    private fieldMeasurementsCatalogService: FieldMeasurementsCatalogService) { }

  ngOnInit(): void {
    this.settingsSub = this.pumpInventoryService.settings.subscribe(val => {
      this.settings = val;
    });
    this.displayOptions = this.pumpInventoryService.pumpInventoryData.getValue().displayOptions.fieldMeasurementOptions;
    this.selectedPumpItemSub = this.pumpCatalogService.selectedPumpItem.subscribe(selectedPump => {
      if (selectedPump) {
        this.form = this.fieldMeasurementsCatalogService.getFormFromFieldMeasurements(selectedPump.fieldMeasurements);
        this.fieldDataWarnings = this.pumpCatalogService.checkFieldWarnings(selectedPump, this.settings);
      }
    });
  }

  ngOnDestroy() {
    this.selectedPumpItemSub.unsubscribe();
    this.settingsSub.unsubscribe();
  }

  save() {
    let selectedPump: PumpItem = this.pumpCatalogService.selectedPumpItem.getValue();
    selectedPump.fieldMeasurements = this.fieldMeasurementsCatalogService.updateFieldMeasurementsFromForm(this.form, selectedPump.fieldMeasurements);
    this.fieldDataWarnings = this.pumpCatalogService.checkFieldWarnings(selectedPump, this.settings);
    this.pumpInventoryService.updatePumpItem(selectedPump);
  }

  focusField(str: string) {
    this.pumpInventoryService.focusedDataGroup.next('field-measurements');
    this.pumpInventoryService.focusedField.next(str);
  }

  toggleForm() {
    this.displayForm = !this.displayForm;
  }

  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
    this.pumpInventoryService.modalOpen.next(false);
  }

  changeLoadMethod() {
    this.fieldMeasurementsCatalogService.changeLoadMethod(this.form);
    this.save();
  }

  openOperatingHoursModal() {
    let selectedPumpItem = this.pumpCatalogService.getUpdatedSelectedPumpItem();
    this.operatingHours = selectedPumpItem.fieldMeasurements.operatingHours;
    this.showOperatingHoursModal = true;
    this.pumpInventoryService.modalOpen.next(true);
  }

  updateOperatingHours(oppHours: OperatingHours) {
    this.form.controls.yearlyOperatingHours.patchValue(oppHours.hoursPerYear);
    let selectedPump: PumpItem = this.pumpCatalogService.selectedPumpItem.getValue();
    selectedPump.fieldMeasurements.operatingHours = oppHours;
    this.save();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth() {
    if (this.formElement && this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }

}