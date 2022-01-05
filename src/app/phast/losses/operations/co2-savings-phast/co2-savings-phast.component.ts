import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { OtherFuel, otherFuels } from '../../../../calculator/utilities/co2-savings/co2-savings-form/co2FuelSavingsFuels';
import { Co2SavingsData } from '../../../../calculator/utilities/co2-savings/co2-savings.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { EGridService, SubRegionData, SubregionEmissions } from '../../../../shared/helper-services/e-grid.service';
import { Settings } from '../../../../shared/models/settings';
import { Co2SavingsPhastService } from './co2-savings-phast.service';

@Component({
  selector: 'app-co2-savings-phast',
  templateUrl: './co2-savings-phast.component.html',
  styleUrls: ['./co2-savings-phast.component.css']
})
export class Co2SavingsPhastComponent implements OnInit {

  @Input()
  co2SavingsData: Co2SavingsData;
  @Input()
  isFormDisabled: boolean;
  @Input()
  isBaseline: boolean;
  @Input()
  settings: Settings;
  @Output('emitUpdateCo2SavingsData')
  emitUpdateCo2SavingsData = new EventEmitter<Co2SavingsData>();
  @Output('emitCurrentField')
  emitCurrentField = new EventEmitter<string>();

  form: FormGroup;
  hasValidSubRegion: boolean;
  subregions: Array<{
    subregion: string,
    outputRate: number
  }>;
  zipCodeSubRegionData: Array<string>;
  co2SavingsDataSub: Subscription;

  otherFuels: Array<OtherFuel>;
  fuelOptions: Array<{
    fuelType: string,
    outputRate: number
  }>;

  constructor(private phastCO2SavingsService: Co2SavingsPhastService, 
    private egridService: EGridService, 
    private cd: ChangeDetectorRef,
    private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.otherFuels = otherFuels;
    if (this.co2SavingsData.fuelType) {
      let tmpOtherFuel: OtherFuel = _.find(this.otherFuels, (val) => { return this.co2SavingsData.energySource === val.energySource; });
      this.fuelOptions = tmpOtherFuel.fuelTypes;
    }
    this.initCo2SavingsSubscription();
  }

  ngOnDestroy() {
    this.phastCO2SavingsService.baselineCo2SavingsData.next(undefined);
    this.phastCO2SavingsService.modificationCo2SavingsData.next(undefined);
    this.co2SavingsDataSub.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.isFormDisabled && !changes.isFormDisabled.firstChange) {
      if (this.isFormDisabled) {
        this.disableForm();
      } else {
        this.enableForm();
      }
      this.cd.detectChanges();
    }
  }

  initCo2SavingsSubscription() {
    // Use subscriptions to asynchronous data changes when both BL and MOD forms are open
    if (this.isBaseline) {
      this.phastCO2SavingsService.baselineCo2SavingsData.next(this.co2SavingsData);
      this.co2SavingsDataSub = this.phastCO2SavingsService.baselineCo2SavingsData.subscribe(baselineCo2SavingsData => {
        if (baselineCo2SavingsData) {
          this.co2SavingsData = baselineCo2SavingsData
          this.initForm();
        }
      });
    } else {
      this.phastCO2SavingsService.modificationCo2SavingsData.next(this.co2SavingsData);
      this.co2SavingsDataSub = this.phastCO2SavingsService.modificationCo2SavingsData.subscribe(modificationCo2SavingsData => {
        if (modificationCo2SavingsData) {
          this.co2SavingsData = modificationCo2SavingsData
          this.initForm();
        }
      });
    }
  }

  convertOutputRate(outputRate: number) {   
    let conversionHelper: number = this.convertUnitsService.value(1).from('MMBtu').to(this.settings.energyResultUnit);
    outputRate = outputRate / conversionHelper;
    outputRate = Number(outputRate.toFixed(2));    
    return outputRate;
  }

  disableForm() {
    this.form.controls.eGridSubregion.disable();
    this.form.controls.energySource.disable();
    this.form.controls.fuelType.disable();
    this.form.controls.zipcode.disable();
    this.form.controls.totalEmissionOutputRate.disable();
  }

  enableForm() {
    if (this.co2SavingsData.energyType == 'electricity') {
      if (this.isBaseline) {
        this.form.controls.eGridSubregion.enable();
        this.form.controls.zipcode.enable();
      }
      this.form.controls.totalEmissionOutputRate.enable();
    } else {
      if (this.isBaseline) {
        this.form.controls.energySource.enable();
        this.form.controls.fuelType.enable();
      }
      this.form.controls.totalEmissionOutputRate.enable();
    }
    this.form.controls.totalEmissionOutputRate.enable();

  }

  initForm() {
    this.form = this.phastCO2SavingsService.getEmissionsForm(this.co2SavingsData);
    this.form.controls.energyType.disable();

    // Regions are the same for Mod
    if (!this.isBaseline) {
      this.form.controls.zipcode.disable();
      this.form.controls.eGridSubregion.disable();
      this.form.controls.energySource.disable();
      this.form.controls.fuelType.disable();
    }

    if (this.isFormDisabled) {
      this.disableForm();
    };

    if (this.co2SavingsData.energyType == 'electricity') {
      this.setSubRegionData();
    } else {
      this.setFuelOptions();
      if (!this.isBaseline) {
        this.form.controls.energySource.disable();
        this.form.controls.fuelType.disable();
      }
    }

  }

  focusField(str: string) {
    this.emitCurrentField.emit(str);
  }

  setUserEmissionsOutput() {
    if (this.isBaseline) {
      this.form.controls.userEnteredBaselineEmissions.patchValue(true);
    } else {
      this.form.controls.userEnteredModificationEmissions.patchValue(true);
    }
    this.calculate();
  }

  setZipcode() {
    this.form.controls.userEnteredBaselineEmissions.patchValue(false);
    this.setUserEnteredModificationEmissions(false);
    this.setSubRegionData();
  }

  setUserEnteredModificationEmissions(isUserEnteredValue: boolean) {
    let modificationCo2SavingsData: Co2SavingsData = this.phastCO2SavingsService.modificationCo2SavingsData.getValue();
    if (modificationCo2SavingsData) {
      modificationCo2SavingsData.userEnteredModificationEmissions = isUserEnteredValue;
      this.phastCO2SavingsService.modificationCo2SavingsData.next(modificationCo2SavingsData);
    }
  }

  setFuelOptions(isUserFormChange = false) {
    let otherFuelOptions: OtherFuel = _.find(this.otherFuels, (val) => { return this.form.controls.energySource.value === val.energySource; });
    this.fuelOptions = otherFuelOptions.fuelTypes;
    let fuelType: string = this.fuelOptions[0].fuelType;
    if (!isUserFormChange && this.co2SavingsData.fuelType) {
      // take existing selection
      fuelType = this.co2SavingsData.fuelType;
    }

    this.form.patchValue({
      fuelType: fuelType
    });
    this.setFuelTypeOutputRate(isUserFormChange);
  }


  setFuelTypeOutputRate(isUserFormChange = false) {
    if (this.isBaseline) {
      this.setBaselineFuelTypeOutputRate(isUserFormChange);
    } else {
      this.setModificationFuelTypeOutputRate()
    }
    this.calculate();
  }

  findFuelOutputRate() {
    let selectedFuelOutputRate: number = _.find(this.fuelOptions, (val) => { return this.form.controls.fuelType.value === val.fuelType; }).outputRate; 
    if (selectedFuelOutputRate && this.settings.energyResultUnit != 'MMBtu') {
      selectedFuelOutputRate = this.convertOutputRate(selectedFuelOutputRate);
    }         
    this.form.patchValue({
      totalEmissionOutputRate: selectedFuelOutputRate
    });
  }

  setBaselineFuelTypeOutputRate(isUserFormChange: boolean) {
    if (isUserFormChange || !this.form.controls.userEnteredBaselineEmissions.value) {
      this.findFuelOutputRate();
      this.setUserEnteredModificationEmissions(false);
    } 
  }

  setModificationFuelTypeOutputRate() {
    if (!this.form.controls.userEnteredModificationEmissions.value) {
      this.findFuelOutputRate();
      this.form.controls.userEnteredModificationEmissions.patchValue(false);
    }
  }
  
  setSubRegionData() {
    this.zipCodeSubRegionData = [];

    let subRegionData: SubRegionData = _.find(this.egridService.subRegionsByZipcode, (val) => this.form.controls.zipcode.value === val.zip);
    if (subRegionData) {
      subRegionData.subregions.forEach(subregion => {
        if (subregion !== '') {
          this.zipCodeSubRegionData.push(subregion);
        }
      });
      if (this.isBaseline) {
        this.setBaselineSubregionForm();
      } else {
        this.setModificationSubregionForm()
      }
    } else {
      // not a valid zip, form select is hidden, disabled
      this.form.controls.eGridSubregion.disable();
      this.form.controls.totalEmissionOutputRate.patchValue(null);
      this.form.controls.eGridSubregion.patchValue(null);
    }
    this.calculate();
  }

  setBaselineSubregionForm() {
    if (this.form.controls.eGridSubregion.value === null) {
      // set the first from the subregion list as default
      this.form.controls.eGridSubregion.patchValue(this.zipCodeSubRegionData[0]);
    }
    this.hasValidSubRegion = true;

    this.setSubregionControlStatus();
    if (!this.form.controls.userEnteredBaselineEmissions.value) {
      this.setSubRegionEmissionsOutput();
    }
  }

  setModificationSubregionForm() {
    // set selected baseline subregion value
    this.form.controls.eGridSubregion.patchValue(this.co2SavingsData.eGridSubregion);
    this.hasValidSubRegion = true;
    this.setSubregionControlStatus();

    if (!this.form.controls.userEnteredModificationEmissions.value) {
      this.setSubRegionEmissionsOutput();
    }
  }

  setSubregionControlStatus() {
    if (this.zipCodeSubRegionData.length === 0) {
      // none found - form select is hidden, set form val to null
      this.form.controls.eGridSubregion.disable();
      this.form.controls.eGridSubregion.patchValue(null);
    } else if (this.zipCodeSubRegionData.length === 1) {
      // if only one result, no need to choose from select list
      this.form.controls.eGridSubregion.disable();
    } else if (this.isBaseline && !this.isFormDisabled) {
      this.form.controls.eGridSubregion.enable();
    }
    this.cd.detectChanges();
  }

  setSubRegionEmissionsOutput() {
    // setting default, so mod should not be user entered
    if (!this.isBaseline) {
      this.form.controls.userEnteredModificationEmissions.patchValue(false);
    } else {
      this.setUserEnteredModificationEmissions(false);
    }

    let subregionEmissions: SubregionEmissions = _.find(this.egridService.co2Emissions, (val) => { return this.form.controls.eGridSubregion.value === val.subregion; });
    if (subregionEmissions) {
      this.form.patchValue({
        totalEmissionOutputRate: subregionEmissions.co2Emissions
      });
      this.calculate();
    }
  }

  setLockedModificationValues() {
    let modificationCo2SavingsData: Co2SavingsData = this.phastCO2SavingsService.modificationCo2SavingsData.getValue();
    if (modificationCo2SavingsData) {
      modificationCo2SavingsData.eGridSubregion = this.co2SavingsData.eGridSubregion;
      modificationCo2SavingsData.zipcode = this.co2SavingsData.zipcode;
      // IMPORTANT - the below vales were missing so bl values were not copied over to mod
      modificationCo2SavingsData.energyType = this.co2SavingsData.energyType;
      modificationCo2SavingsData.fuelType = this.co2SavingsData.fuelType;
      modificationCo2SavingsData.energySource = this.co2SavingsData.energySource;
      this.phastCO2SavingsService.modificationCo2SavingsData.next(modificationCo2SavingsData);
    }
  }
  
  calculate() {
    this.co2SavingsData = this.phastCO2SavingsService.getCo2SavingsData(this.form);
    if (this.isBaseline) {
      this.setLockedModificationValues();
    }
    // emit results up to parent component  to save on the ssmt/psat/fsat/etc object
    this.emitUpdateCo2SavingsData.emit(this.co2SavingsData);
  }


}
