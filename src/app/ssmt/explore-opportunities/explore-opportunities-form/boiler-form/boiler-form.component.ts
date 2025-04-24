import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges, ElementRef, HostListener, ViewChild } from '@angular/core';
import { SsmtService } from '../../../ssmt.service';
import { SSMT, BoilerInput } from '../../../../shared/models/steam/ssmt';
import { Settings } from '../../../../shared/models/settings';
import { ExploreOpportunitiesService } from '../../explore-opportunities.service';
import { BoilerService } from '../../../boiler/boiler.service';
import { UntypedFormGroup } from '@angular/forms';
import { StackLossInput } from '../../../../shared/models/steam/steam-inputs';
import { FlueGasMaterial, SolidLiquidFlueGasMaterial } from '../../../../shared/models/materials';
import { SqlDbApiService } from '../../../../tools-suite-api/sql-db-api.service';
import { Co2SavingsData } from '../../../../calculator/utilities/co2-savings/co2-savings.service';
import { AssessmentCo2SavingsService, Co2SavingsDifferent } from '../../../../shared/assessment-co2-savings/assessment-co2-savings.service';
import { OtherFuel, otherFuels } from '../../../../calculator/utilities/co2-savings/co2-savings-form/co2FuelSavingsFuels';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { CompareService } from '../../../compare.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-boiler-form',
    templateUrl: './boiler-form.component.html',
    styleUrls: ['./boiler-form.component.css'],
    standalone: false
})
export class BoilerFormComponent implements OnInit {
  @Input()
  ssmt: SSMT;
  @Input()
  settings: Settings;
  @Input()
  exploreModIndex: number;
  @Output('emitSave')
  emitSave = new EventEmitter<SSMT>();

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setBlowdownRateModalWidth();
  }
  formWidth: number;
  showBlowdownRateModal: boolean = false;


  baselineFuelOptions: Array<FlueGasMaterial | SolidLiquidFlueGasMaterial>;
  modificationFuelOptions: Array<FlueGasMaterial | SolidLiquidFlueGasMaterial>;

  showCombustionEfficiency: boolean = false;
  showFuelType: boolean = false;
  showBlowdownRate: boolean = false;
  showBlowdownFlashed: boolean = false;
  showPreheatBlowdownWater: boolean = false;
  showInitialSteamTemperature: boolean = false;
  showDeaeratorConditions: boolean = false;

  baselineForm: UntypedFormGroup;
  modificationForm: UntypedFormGroup;
  baselineCo2SavingsData: Co2SavingsData;
  modificationCo2SavingsData: Co2SavingsData;
  isInitializingCo2SavingsData: boolean;
  co2SavingsDifferentSubscription: Subscription;
  co2SavingsDifferent: Co2SavingsDifferent;

  otherFuels: Array<OtherFuel>;
  fuelOptions: Array<{
    fuelType: string,
    outputRate: number
  }>;

  constructor(private exploreOpportunitiesService: ExploreOpportunitiesService, 
    private convertUnitsService: ConvertUnitsService,
    private compareService: CompareService,
    private assessmentCo2SavingsService: AssessmentCo2SavingsService, private sqlDbApiService: SqlDbApiService, private boilerService: BoilerService,
    private ssmtService: SsmtService) { }

  ngOnInit() {
    this.setCo2SavingsData();
    this.init();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.exploreModIndex) {
      if (!changes.exploreModIndex.isFirstChange()) {
        this.setCo2SavingsData();
        this.init();
      }
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setBlowdownRateModalWidth();
    }, 100)
  }

  init() {
    this.baselineForm = this.boilerService.initFormFromObj(this.ssmt.boilerInput, this.settings);
    this.baselineForm.disable();
    this.modificationForm = this.boilerService.initFormFromObj(this.ssmt.modifications[this.exploreModIndex].ssmt.boilerInput, this.settings);

    this.initCombustionEfficiency();
    this.initFuel();
    this.initBlowdownRate();
    this.initBlowdownFlashed();
    this.initPreheatMakeupWater();
    this.initInitialSteamTemperature();
    this.initDeaeratorConditions();

    if (this.showCombustionEfficiency || this.showFuelType || this.showBlowdownRate || this.showBlowdownFlashed || this.showPreheatBlowdownWater || this.showInitialSteamTemperature || this.showDeaeratorConditions) {
      this.ssmt.modifications[this.exploreModIndex].exploreOppsShowBoilerData = {hasOpportunity: true, display: "Adjust Boiler Operations"};      
    } else {
      this.ssmt.modifications[this.exploreModIndex].exploreOppsShowBoilerData = {hasOpportunity: false, display: "Adjust Boiler Operations"};      
    }
  }

  
  setCo2SavingsData() {
    this.isInitializingCo2SavingsData = true;
    this.co2SavingsDifferent = this.compareService.isCo2SavingsDifferent(false, this.ssmt, this.ssmt.modifications[this.exploreModIndex].ssmt);
    this.baselineCo2SavingsData = this.ssmt.co2SavingsData;
    let modificationCo2SavingsData: Co2SavingsData = this.ssmt.modifications[this.exploreModIndex].ssmt.co2SavingsData;
    if (this.ssmt.co2SavingsData) {
      this.modificationCo2SavingsData = modificationCo2SavingsData;
    } else {
      modificationCo2SavingsData = this.assessmentCo2SavingsService.getCo2SavingsDataFromSettingsObject(this.settings);
    }
    this.otherFuels = otherFuels;
    if (!modificationCo2SavingsData.energySource) {
      modificationCo2SavingsData.energyType = 'fuel';
      modificationCo2SavingsData.energySource = 'Natural Gas';
    }
    this.modificationCo2SavingsData = modificationCo2SavingsData;
    let shouldSetOutputRate: boolean = false;
    if(this.modificationCo2SavingsData.totalFuelEmissionOutputRate === undefined || (this.modificationCo2SavingsData.energySource !== 'Mixed Fuels' && !this.modificationCo2SavingsData.fuelType)) {
      shouldSetOutputRate = true;
    } 
    this.setEnergySource(shouldSetOutputRate);
    this.isInitializingCo2SavingsData = false;
  }

  setEnergySource(shouldSetOutputRate: boolean = true) {
    this.setFuelOptions();
    let outputRate: number = this.fuelOptions[0].outputRate;
    if(this.settings.unitsOfMeasure !== 'Imperial'){
      outputRate = this.convertUnitsService.convertInvertedEnergy(outputRate, 'MMBtu', 'GJ');
      outputRate = Number(outputRate.toFixed(2));
    }
    if (shouldSetOutputRate) {
      this.modificationCo2SavingsData.totalFuelEmissionOutputRate = outputRate;
      this.modificationCo2SavingsData.fuelType = this.fuelOptions[0].fuelType;
    }

    if (!this.isInitializingCo2SavingsData) {
      // other opps forms don't handle triggered save-->onChanges() event during init
      this.save();
    }
  }

  setFuelOptions(){
    let tmpOtherFuel: OtherFuel = this.otherFuels.find((val) => { return val.energySource === this.modificationCo2SavingsData.energySource });
    this.fuelOptions = tmpOtherFuel.fuelTypes;
  }
  
  setFuel() {
    let tmpFuel: { fuelType: string, outputRate: number } = this.fuelOptions.find((val) => { return this.modificationCo2SavingsData.fuelType === val.fuelType; });
    let outputRate: number = tmpFuel.outputRate;
    if(this.settings.unitsOfMeasure !== 'Imperial'){
      outputRate = this.convertUnitsService.convertInvertedEnergy(outputRate, 'MMBtu', 'GJ');
    }
    this.modificationCo2SavingsData.totalFuelEmissionOutputRate = outputRate;
    this.save();
  }

  initCombustionEfficiency() {
    if (this.baselineForm.controls.combustionEfficiency.value !== this.modificationForm.controls.combustionEfficiency.value) {
      this.showCombustionEfficiency = true;
    } else {
      this.showCombustionEfficiency = false;
    }
  }

  initFuel() {
    if (this.co2SavingsDifferent.fuelType || this.co2SavingsDifferent.fuelType || this.co2SavingsDifferent.totalFuelEmissionOutputRate) {
      this.showFuelType = true;
    } else {
      this.showFuelType = false;
    }
  }

  initBlowdownRate() {
    if (this.baselineForm.controls.blowdownRate.value !== this.modificationForm.controls.blowdownRate.value) {
      this.showBlowdownRate = true;
    } else {
      this.showBlowdownRate = false
    }
  }

  initBlowdownFlashed() {
    if (this.baselineForm.controls.blowdownFlashed.value !== this.modificationForm.controls.blowdownFlashed.value) {
      this.showBlowdownFlashed = true;
    } else {
      this.showBlowdownFlashed = false
    }
  }

  initPreheatMakeupWater() {
    if (this.baselineForm.controls.preheatMakeupWater.value !== this.modificationForm.controls.preheatMakeupWater.value ||
      this.baselineForm.controls.approachTemperature.value !== this.modificationForm.controls.approachTemperature.value) {
      this.showPreheatBlowdownWater = true;
    } else {
      this.showPreheatBlowdownWater = false
    }
  }

  initInitialSteamTemperature() {
    if (this.baselineForm.controls.steamTemperature.value !== this.modificationForm.controls.steamTemperature.value) {
      this.showInitialSteamTemperature = true;
    } else {
      this.showInitialSteamTemperature = false
    }
  }

  initDeaeratorConditions() {
    if (this.baselineForm.controls.deaeratorPressure.value !== this.modificationForm.controls.deaeratorPressure.value ||
      this.baselineForm.controls.deaeratorVentRate.value !== this.modificationForm.controls.deaeratorVentRate.value) {
      this.showDeaeratorConditions = true;
    } else {
      this.showDeaeratorConditions = false;
    }
  }

  toggleBoilerData() {
    if (this.ssmt.modifications[this.exploreModIndex].exploreOppsShowBoilerData.hasOpportunity === false) {
      this.showCombustionEfficiency = false;
      this.showFuelType = false;
      this.showBlowdownRate = false;
      this.showBlowdownFlashed = false;
      this.showPreheatBlowdownWater = false;
      this.showInitialSteamTemperature = false;
      this.showDeaeratorConditions = false;
      this.toggleDeaeratorConditions();
      this.toggleInitialSteamTemperature();
      this.togglePreheatBlowdownWater();
      this.toggleBlowdownFlashed();
      this.toggleBlowdownRate();
      this.toggleCombustionEfficiency();
      this.toggleFuelData();
    }
  }

  toggleCombustionEfficiency() {
    if (this.showCombustionEfficiency === false) {
      this.modificationForm.controls.combustionEfficiency.patchValue(this.baselineForm.controls.combustionEfficiency.value);
      this.save();
    }
  }

  toggleFuelData() {
    if (this.showFuelType === false) {
      this.modificationCo2SavingsData.energySource = this.ssmt.co2SavingsData.energySource; 
      this.modificationCo2SavingsData.fuelType = this.ssmt.co2SavingsData.fuelType; 
      this.setFuelOptions();
      this.modificationCo2SavingsData.totalFuelEmissionOutputRate = this.ssmt.co2SavingsData.totalFuelEmissionOutputRate; 
      this.save();
    }
  }

  toggleBlowdownRate() {
    if (this.showBlowdownRate === false) {
      this.modificationForm.controls.blowdownRate.patchValue(this.baselineForm.controls.blowdownRate.value);
      this.save();
    }
  }

  toggleBlowdownFlashed() {
    if (this.showBlowdownFlashed === false) {
      this.modificationForm.controls.blowdownFlashed.patchValue(this.baselineForm.controls.blowdownFlashed.value);
      this.save();
    }
  }

  togglePreheatBlowdownWater() {
    if (this.showFuelType === false) {
      this.modificationForm.controls.preheatMakeupWater.patchValue(this.baselineForm.controls.preheatMakeupWater.value);
      this.modificationForm.controls.approachTemperature.patchValue(this.baselineForm.controls.approachTemperature.value);
      this.save();
    }
  }

  toggleInitialSteamTemperature() {
    if (this.showInitialSteamTemperature === false) {
      this.modificationForm.controls.steamTemperature.patchValue(this.baselineForm.controls.steamTemperature.value);
      this.save();
    }
  }
  toggleDeaeratorConditions() {
    if (this.showDeaeratorConditions === false) {
      this.modificationForm.controls.deaeratorPressure.patchValue(this.baselineForm.controls.deaeratorPressure.value);
      this.modificationForm.controls.deaeratorVentRate.patchValue(this.baselineForm.controls.deaeratorVentRate.value);
      this.save();
    }
  }

  save() {
    let stackLossInput: StackLossInput = this.ssmt.modifications[this.exploreModIndex].ssmt.boilerInput.stackLossInput;
    let tmpModificationBoilerInput: BoilerInput = this.boilerService.initObjFromForm(this.modificationForm);
    tmpModificationBoilerInput.stackLossInput = stackLossInput;
    this.ssmt.modifications[this.exploreModIndex].ssmt.boilerInput = tmpModificationBoilerInput;
    // Use copy so co2SavingsData isn't overwritten from ssmt.component.updateModificationCO2Savings()
    this.ssmt.modifications[this.exploreModIndex].ssmt.co2SavingsData = JSON.parse(JSON.stringify(this.modificationCo2SavingsData));  
    this.co2SavingsDifferent = this.compareService.isCo2SavingsDifferent(false, this.ssmt, this.ssmt.modifications[this.exploreModIndex].ssmt);

    this.emitSave.emit(this.ssmt);
  }

  focusField(str: string) {
    this.exploreOpportunitiesService.currentTab.next('boiler');
    this.ssmtService.isBaselineFocused.next(false);
    this.exploreOpportunitiesService.currentField.next(str);
  }

  focusOut() {
    // this.exploreOpportunitiesService.currentTab.next('boiler');
    // this.exploreOpportunitiesService.currentField.next('default');
  }

  closeBlowdownRateModal() {
    this.showBlowdownRateModal = false;
    // this.ssmtService.modalOpen.next(false);
  }

  openBlowdownRateModal() {
    this.showBlowdownRateModal = true;
    // this.ssmtService.modalOpen.next(true);
  }

  saveAndCloseBlowdownRateModal() {
    this.save();
    this.closeBlowdownRateModal();
  }

  setBlowdownRateModalWidth() {
    if (this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }
}
