import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import * as _ from 'lodash';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { coalFuels, EAFOtherFuels, OtherFuel, otherFuels } from '../../../../calculator/utilities/co2-savings/co2-savings-form/co2FuelSavingsFuels';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { EGridService, SubRegionData, SubregionEmissions } from '../../../../shared/helper-services/e-grid.service';
import { PhastCo2SavingsData } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
import { LossesService } from '../../losses.service';
import { Co2SavingsPhastService } from './co2-savings-phast.service';

@Component({
  selector: 'app-co2-savings-phast',
  templateUrl: './co2-savings-phast.component.html',
  styleUrls: ['./co2-savings-phast.component.css']
})
export class Co2SavingsPhastComponent implements OnInit {

  @Input()
  co2SavingsData: PhastCo2SavingsData;
  @Input()
  isFormDisabled: boolean;
  @Input()
  isBaseline: boolean;
  @Input()
  settings: Settings;
  @Output('emitUpdateCo2SavingsData')
  emitUpdateCo2SavingsData = new EventEmitter<PhastCo2SavingsData>();
  @Output('emitCurrentField')
  emitCurrentField = new EventEmitter<string>();

  @ViewChild('mixedCO2EmissionsModal', { static: false }) public mixedCO2EmissionsModal: ModalDirective;
  mixedCO2EmissionsOutputRate: number;


  form: FormGroup;
  hasValidSubRegion: boolean;
  subregions: Array<{
    subregion: string,
    outputRate: number
  }>;
  zipCodeSubRegionData: Array<string>;
  co2SavingsDataSub: Subscription;

  energySources: Array<OtherFuel>;
  eafOtherFuelSources: Array<OtherFuel>;

  fuelOptions: Array<{
    fuelType: string,
    outputRate: number
  }>;
  coalFuelOptions: Array<{
    fuelType: string,
    outputRate: number
  }>;
  eafOtherFuelOptions: Array<{
    fuelType: string,
    outputRate: number
  }>;
  showMixedFuelsModal: boolean;
  showOtherFuelsMixedModal: boolean;
  otherFuelMixedCO2SavingsData: PhastCo2SavingsData[];
  isUsAverage: boolean;

  constructor(private phastCO2SavingsService: Co2SavingsPhastService, 
    private egridService: EGridService, 
    private cd: ChangeDetectorRef,
    private lossesService: LossesService,
    private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
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
    if (changes.co2SavingsData && !changes.co2SavingsData.firstChange) {
      this.initForm();
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
          this.co2SavingsData.eGridSubregion = modificationCo2SavingsData.eGridSubregion;
          this.co2SavingsData.zipcode = modificationCo2SavingsData.zipcode;
          this.co2SavingsData.userEnteredModificationEmissions = modificationCo2SavingsData.userEnteredModificationEmissions;
          this.initForm();
        }
      });
    }
  }

  disableForm() {
    this.form.disable();
  }

  enableForm() {
    if (this.isBaseline) {
        this.form.controls.eGridSubregion.enable();
        this.form.controls.zipcode.enable();
    } 
    this.form.controls.energySource.enable();
    this.form.controls.fuelType.enable();
    this.form.controls.totalEmissionOutputRate.enable();
    this.form.controls.eafOtherFuelSource.enable();
    this.form.controls.otherFuelType.enable();
    this.form.controls.coalFuelType.enable();
    this.form.controls.totalNaturalGasEmissionOutputRate.enable();
    this.form.controls.totalFuelEmissionOutputRate.enable();
    this.form.controls.totalCoalEmissionOutputRate.enable();
    this.form.controls.totalOtherEmissionOutputRate.enable();
  }

  initForm() {
    let shouldSetOutputRate: boolean = true;
    this.form = this.phastCO2SavingsService.getEmissionsForm(this.co2SavingsData);
    // Regions are the same for Mod
    if (!this.isBaseline) {
      this.form.controls.zipcode.disable();
      this.form.controls.eGridSubregion.disable();
    }
    this.setSubRegionData();
    
    // Form must be disabled after subRegionData is set
    if (this.isFormDisabled) {
      this.disableForm();
    };

    if (this.settings.furnaceType == 'Electric Arc Furnace (EAF)') {
      this.coalFuelOptions = coalFuels;
      this.eafOtherFuelSources = EAFOtherFuels;
      shouldSetOutputRate = !this.co2SavingsData.totalCoalEmissionOutputRate;
      this.setCoalFuel(shouldSetOutputRate);
      shouldSetOutputRate = !this.co2SavingsData.totalOtherEmissionOutputRate;
      this.setEAFFuelSource(shouldSetOutputRate);
    } else {
      this.energySources = otherFuels;
      shouldSetOutputRate = !this.co2SavingsData.totalFuelEmissionOutputRate;
      this.setEnergySource(shouldSetOutputRate);
    }
  }

  setEnergySource(shouldSetOutputRate: boolean = true) {
    let tmpOtherFuel: OtherFuel = _.find(this.energySources, (val) => { return val.energySource === this.form.controls.energySource.value });
    this.fuelOptions = tmpOtherFuel.fuelTypes;
    let outputRate: number = this.fuelOptions[0].outputRate;
    if(this.settings.unitsOfMeasure !== 'Imperial'){
        outputRate = this.convertUnitsService.convertInvertedEnergy(outputRate, 'MMBtu', this.settings.phastRollupFuelUnit);
        outputRate = Number(outputRate.toFixed(2));
    }
    if (shouldSetOutputRate) {
      this.form.patchValue({
          totalFuelEmissionOutputRate: outputRate,
          fuelType: this.fuelOptions[0].fuelType
      });
    }
    this.calculate();
  }

  setEAFFuelSource(shouldSetOutputRate: boolean = true) {
    let eafOtherFuelSources: OtherFuel = _.find(this.eafOtherFuelSources, (val) => { return this.form.controls.eafOtherFuelSource.value === val.energySource; });
    this.eafOtherFuelOptions = eafOtherFuelSources.fuelTypes;

    let outputRate: number = this.eafOtherFuelOptions[0].outputRate;
    if(this.settings.unitsOfMeasure !== 'Imperial'){
      outputRate = this.convertUnitsService.convertInvertedEnergy(outputRate, 'MMBtu', this.settings.phastRollupFuelUnit);
      outputRate = Number(outputRate.toFixed(2));
    }

    if (shouldSetOutputRate) {
      this.form.patchValue({
        totalOtherEmissionOutputRate: outputRate,
        otherFuelType: this.eafOtherFuelOptions[0].fuelType
      });
    }

    this.calculate();
  }

  setFuel() {
    let outputRate: number = this.getFuelOutputRate(this.form.controls.fuelType.value, this.fuelOptions);
    this.form.patchValue({
      totalFuelEmissionOutputRate: outputRate
    });
    this.calculate();
  }

  setCoalFuel(shouldSetOutputRate: boolean = true, isUserChange?: boolean) {
    let outputRate: number = this.getFuelOutputRate(this.form.controls.coalFuelType.value, this.coalFuelOptions);
    if (shouldSetOutputRate) {
      this.form.patchValue({
        totalCoalEmissionOutputRate: outputRate
      });
    }

    if (isUserChange) {
      this.calculate();
    }
  }

  setOtherFuel() {
    let outputRate: number = this.getFuelOutputRate(this.form.controls.otherFuelType.value, this.eafOtherFuelOptions);
    this.form.patchValue({
      totalOtherEmissionOutputRate: outputRate
    });
    this.calculate();
  }

  getFuelOutputRate(fuelType: string, options: Array<{fuelType: string, outputRate: number}>): number {
    let fuel = _.find(options, (val) => { return fuelType === val.fuelType; });
    let outputRate: number = fuel.outputRate;
    if(this.settings.unitsOfMeasure !== 'Imperial'){
      outputRate = this.convertUnitsService.convertInvertedEnergy(outputRate, 'MMBtu', this.settings.phastRollupFuelUnit);
      outputRate = Number(outputRate.toFixed(2));
    }
    return outputRate;
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
    let modificationCo2SavingsData: PhastCo2SavingsData = this.phastCO2SavingsService.modificationCo2SavingsData.getValue();
    if (modificationCo2SavingsData) {
      modificationCo2SavingsData.userEnteredModificationEmissions = isUserEnteredValue;
      this.phastCO2SavingsService.modificationCo2SavingsData.next(modificationCo2SavingsData);
    }
  }

  
  setSubRegionData() {
    this.zipCodeSubRegionData = [];

    let subRegionData: SubRegionData = _.find(this.egridService.subRegionsByZipcode, (val) => this.form.controls.zipcode.value === val.zip);
    if (subRegionData) {
      this.isUsAverage = false;
      subRegionData.subregions.forEach(subregion => {
        if (subregion !== '') {
          this.zipCodeSubRegionData.push(subregion);
        }
      });
    } else {
      // not a valid zip, set emmissions to US Average
      subRegionData = _.find(this.egridService.subRegionsByZipcode, (val) => val.zip === '00000');
      subRegionData.subregions.forEach(subregion => {
        if (subregion !== '') {
          this.zipCodeSubRegionData.push(subregion);
        }
      });
      this.isUsAverage = true;
    }

    if (this.isBaseline) {
      this.setBaselineSubregionForm();
    } else {
      this.setModificationSubregionForm()
    }

    this.calculate();
  }

  setBaselineSubregionForm() {
    if (this.form.controls.eGridSubregion.value === 'U.S. Average' || this.form.controls.eGridSubregion.value === '' || this.form.controls.eGridSubregion.value === null || this.isUsAverage) {
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

  setSubRegionEmissionsOutput(isUserChange?: boolean) {
    // setting default, so mod should not be user entered
    if (!this.isBaseline) {
      this.form.controls.userEnteredModificationEmissions.patchValue(false);
    } else {
      this.setUserEnteredModificationEmissions(false);
    }

    let subregionEmissions: SubregionEmissions = this.egridService.findEGRIDCO2Emissions(this.form.controls.eGridSubregion.value);
    if (subregionEmissions) {

      this.form.patchValue({
        totalEmissionOutputRate: subregionEmissions.co2Emissions
      });
      if (isUserChange) {
        this.calculate();
      }
    }
  }

  setLockedModificationValues() {
    let modificationCo2SavingsData: PhastCo2SavingsData = this.phastCO2SavingsService.modificationCo2SavingsData.getValue();
    if (modificationCo2SavingsData && !this.co2SavingsData.userEnteredBaselineEmissions) {
      modificationCo2SavingsData.eGridSubregion = this.co2SavingsData.eGridSubregion;
      modificationCo2SavingsData.zipcode = this.co2SavingsData.zipcode;
      this.phastCO2SavingsService.modificationCo2SavingsData.next(modificationCo2SavingsData);
    }
  }
  
  calculate() {
    this.co2SavingsData = this.phastCO2SavingsService.getCo2SavingsData(this.form);
    this.co2SavingsData.otherFuelMixedCO2SavingsData = this.otherFuelMixedCO2SavingsData;
    if (this.isBaseline) {
      this.setLockedModificationValues();
    }
    // emit results up to parent component  to save on the ssmt/psat/fsat/etc object
    this.emitUpdateCo2SavingsData.emit(this.co2SavingsData);
  }

  showMixedCO2EmissionsModal() {
    this.showMixedFuelsModal = true;
    this.lossesService.modalOpen.next(true);
    this.mixedCO2EmissionsModal.show();
  }

  showOtherFuelsMixedCO2EmissionsModal() {
    this.showOtherFuelsMixedModal = true;
    this.lossesService.modalOpen.next(true);
    this.mixedCO2EmissionsModal.show();
  }

  hideMixedCO2EmissionsModal() {
    if (this.showMixedCO2EmissionsModal) {
      this.showMixedFuelsModal = false;
    } else {
      this.showOtherFuelsMixedModal = false;
    }
    this.lossesService.modalOpen.next(false);
    this.mixedCO2EmissionsModal.hide();
  }

  updateMixedCO2EmissionsModalData(mixedOutputRate: number) {
    this.mixedCO2EmissionsOutputRate = mixedOutputRate;
  }

  applyMixedCO2EmissionsModal() {
    if (this.showMixedFuelsModal) {
      this.form.patchValue({totalFuelEmissionOutputRate: this.mixedCO2EmissionsOutputRate})
      this.showMixedFuelsModal = false;
    } else {
      this.form.patchValue({totalOtherEmissionOutputRate: this.mixedCO2EmissionsOutputRate})
      this.showOtherFuelsMixedModal = false;
    }

    this.lossesService.modalOpen.next(false);
    this.mixedCO2EmissionsModal.hide();
    this.calculate();
  }

  saveOtherFuelsMixedList(mixedFuelsList: Array<PhastCo2SavingsData>) {
    this.otherFuelMixedCO2SavingsData = mixedFuelsList;
    this.calculate();
  }

}
