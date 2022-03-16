import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges, ViewChild } from '@angular/core';
import { SSMT, GeneralSteamOperations } from '../../shared/models/steam/ssmt';
import { Settings } from '../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { OperationsService } from './operations.service';
import { OperatingHours, OperatingCosts } from '../../shared/models/operations';
import { Co2SavingsData } from '../../calculator/utilities/co2-savings/co2-savings.service';
import { AssessmentCo2SavingsService } from '../../shared/assessment-co2-savings/assessment-co2-savings.service';
import { SsmtService } from '../ssmt.service';
import { OtherFuel, otherFuels } from '../../calculator/utilities/co2-savings/co2-savings-form/co2FuelSavingsFuels';
import * as _ from 'lodash';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { ModalDirective } from 'ngx-bootstrap/modal';


@Component({
  selector: 'app-operations',
  templateUrl: './operations.component.html',
  styleUrls: ['./operations.component.css']
})
export class OperationsComponent implements OnInit {
  @Input()
  ssmt: SSMT;
  @Input()
  settings: Settings;
  @Output('emitSave')
  emitSave = new EventEmitter<SSMT>();
  @Input()
  selected: boolean;
  @Input()
  inSetup: boolean;
  @Input()
  isBaseline: boolean;
  @Input()
  modificationIndex: number;

  @ViewChild('mixedCO2EmissionsModal', { static: false }) public mixedCO2EmissionsModal: ModalDirective;

  idString: string = 'baseline_';

  co2SavingsFormDisabled: boolean = false;
  co2SavingsData: Co2SavingsData;
  operationsForm: FormGroup;

  otherFuels: Array<OtherFuel>;
  fuelOptions: Array<{
    fuelType: string,
    outputRate: number
  }>;
  mixedCO2EmissionsOutputRate: number;

  constructor(private operationsService: OperationsService,
    private ssmtService: SsmtService,
    private convertUnitsService: ConvertUnitsService,
    private assessmentCo2SavingsService: AssessmentCo2SavingsService) { }

  ngOnInit() {
    this.initForm();
    this.setCo2SavingsData();
    if (!this.isBaseline) {
      this.idString = 'modification_';
      if (!this.inSetup && !this.selected) {
        this.co2SavingsFormDisabled = true;
      }
    } else {
      if (!this.inSetup && !this.selected) {
        this.co2SavingsFormDisabled = true;
      }
    }

    if (this.selected === false) {
      this.disableForm();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.isFirstChange()) {
      if (this.selected === true) {
        this.enableForm();
        this.co2SavingsFormDisabled = false;
      } else if (this.selected === false) {
        this.disableForm();
        this.co2SavingsFormDisabled = true;
      }
    }
    if(changes.modificationIndex && !changes.modificationIndex.isFirstChange()){
      this.initForm();
      this.setCo2SavingsData();
    }
  }

  updateCo2SavingsData(co2SavingsData?: Co2SavingsData) {
    // Only update non-fuel fields
    this.co2SavingsData.totalEmissionOutputRate = co2SavingsData.totalEmissionOutputRate,
    this.co2SavingsData.eGridSubregion = co2SavingsData.eGridSubregion,
    this.co2SavingsData.userEnteredBaselineEmissions = co2SavingsData.userEnteredBaselineEmissions,
    this.co2SavingsData.userEnteredModificationEmissions = co2SavingsData.userEnteredModificationEmissions,
    this.co2SavingsData.zipcode = co2SavingsData.zipcode,
    this.save();
  }

  setCo2SavingsData() {
    let co2SavingsData: Co2SavingsData = this.ssmt.co2SavingsData;
    if (this.ssmt.co2SavingsData) {
      this.co2SavingsData = co2SavingsData;
    } else {
      co2SavingsData = this.assessmentCo2SavingsService.getCo2SavingsDataFromSettingsObject(this.settings);
    }
    this.otherFuels = otherFuels;
    if (!co2SavingsData.energySource) {
      co2SavingsData.energyType = 'fuel';
      co2SavingsData.energySource = 'Natural Gas';
    }
    this.co2SavingsData = co2SavingsData;
    let shouldSetOutputRate: boolean = false;
    if(!this.co2SavingsData.totalFuelEmissionOutputRate) {
      shouldSetOutputRate = true;
    } 
    this.setEnergySource(shouldSetOutputRate);
  }

  setFuelOptions(){
    let tmpOtherFuel: OtherFuel = _.find(this.otherFuels, (val) => { return val.energySource === this.co2SavingsData.energySource });
    this.fuelOptions = tmpOtherFuel.fuelTypes;
  }

  setEnergySource(shouldSetOutputRate: boolean = true) {
    this.setFuelOptions();
    let outputRate: number = this.fuelOptions[0].outputRate;
    if(this.settings.unitsOfMeasure !== 'Imperial'){
      outputRate = this.convertUnitsService.convertInvertedEnergy(outputRate, 'MMBtu', 'GJ');
      outputRate = Number(outputRate.toFixed(2));
    }
    if (shouldSetOutputRate) {
      this.co2SavingsData.totalFuelEmissionOutputRate = outputRate;
      this.co2SavingsData.fuelType = this.fuelOptions[0].fuelType;
    }
    this.save();
  }

  setFuel() {
    let tmpFuel: { fuelType: string, outputRate: number } = _.find(this.fuelOptions, (val) => { return this.co2SavingsData.fuelType === val.fuelType; });
    let outputRate: number = tmpFuel.outputRate;
    if(this.settings.unitsOfMeasure !== 'Imperial'){
      outputRate = this.convertUnitsService.convertInvertedEnergy(outputRate, 'MMBtu', 'GJ');
    }
    this.co2SavingsData.totalFuelEmissionOutputRate = outputRate;
    this.save();
  }


  focusField(str: string) {
    this.ssmtService.currentField.next(str);
  }

  initForm(){
    this.operationsForm = this.operationsService.getForm(this.ssmt, this.settings);
    
  }

  disableForm() {
    this.operationsForm.disable();
  }

  enableForm() {
    this.operationsForm.enable();
  }

  showMixedCO2EmissionsModal() {
    this.ssmtService.modalOpen.next(true);
    this.mixedCO2EmissionsModal.show();
  }

  hideMixedCO2EmissionsModal() {
    this.ssmtService.modalOpen.next(false);
    this.mixedCO2EmissionsModal.hide();
  }

  updateMixedCO2EmissionsModalData(mixedOutputRate: number) {
    this.mixedCO2EmissionsOutputRate = mixedOutputRate;
  }

  applyMixedCO2EmissionsModal() {
    this.co2SavingsData.energySource = 'Mixed Fuels';
    this.co2SavingsData.fuelType = undefined;
    this.co2SavingsData.totalFuelEmissionOutputRate = this.mixedCO2EmissionsOutputRate;
    this.ssmtService.modalOpen.next(false);
    this.mixedCO2EmissionsModal.hide();
    this.save();
  }

  saveOtherFuelsMixedList(mixedFuelsList: Array<Co2SavingsData>) {
    this.ssmt.otherFuelMixedCO2SavingsData = mixedFuelsList;
    this.save();
  }

  save() {
    let newData: {
      operatingHours: OperatingHours, operatingCosts: OperatingCosts, generalSteamOperations: GeneralSteamOperations
    } = this.operationsService.getOperationsDataFromForm(this.operationsForm);
    this.ssmt.operatingCosts = newData.operatingCosts;
    this.ssmt.operatingHours.hoursPerYear = newData.operatingHours.hoursPerYear;
    this.ssmt.generalSteamOperations = newData.generalSteamOperations;
    this.ssmt.co2SavingsData = this.co2SavingsData;
    this.emitSave.emit(this.ssmt);
  }
}
