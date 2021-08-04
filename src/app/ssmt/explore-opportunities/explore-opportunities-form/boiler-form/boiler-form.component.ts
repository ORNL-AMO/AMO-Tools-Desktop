import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges, ElementRef, HostListener, ViewChild } from '@angular/core';
import { SsmtService } from '../../../ssmt.service';
import { SSMT, BoilerInput } from '../../../../shared/models/steam/ssmt';
import { Settings } from '../../../../shared/models/settings';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { ExploreOpportunitiesService } from '../../explore-opportunities.service';
import { BoilerService } from '../../../boiler/boiler.service';
import { FormGroup } from '@angular/forms';
import { StackLossInput } from '../../../../shared/models/steam/steam-inputs';
import { FlueGasMaterial, SolidLiquidFlueGasMaterial } from '../../../../shared/models/materials';

@Component({
  selector: 'app-boiler-form',
  templateUrl: './boiler-form.component.html',
  styleUrls: ['./boiler-form.component.css']
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

  baselineForm: FormGroup;
  modificationForm: FormGroup;

  constructor(private exploreOpportunitiesService: ExploreOpportunitiesService, private suiteDbService: SuiteDbService, private boilerService: BoilerService,
    private ssmtService: SsmtService) { }

  ngOnInit() {
    this.init();
    this.setFuelTypes();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.exploreModIndex) {
      if (!changes.exploreModIndex.isFirstChange()) {
        this.init();
      }
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setBlowdownRateModalWidth();
    }, 100)
  }

  setFuelTypes(save?: boolean) {
    if (this.baselineForm.controls.fuelType.value === 0) {
      this.baselineFuelOptions = this.suiteDbService.selectSolidLiquidFlueGasMaterials();
    } else if (this.baselineForm.controls.fuelType.value === 1) {
      this.baselineFuelOptions = this.suiteDbService.selectGasFlueGasMaterials();
    }
    if (this.modificationForm.controls.fuelType.value === 0) {
      this.modificationFuelOptions = this.suiteDbService.selectSolidLiquidFlueGasMaterials();
    } else if (this.modificationForm.controls.fuelType.value === 1) {
      this.modificationFuelOptions = this.suiteDbService.selectGasFlueGasMaterials();
    }
    if (save) {
      this.save();
    }
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

  initCombustionEfficiency() {
    if (this.baselineForm.controls.combustionEfficiency.value !== this.modificationForm.controls.combustionEfficiency.value) {
      this.showCombustionEfficiency = true;
    } else {
      this.showCombustionEfficiency = false;
    }
  }

  initFuel() {
    if (this.baselineForm.controls.fuel.value !== this.modificationForm.controls.fuel.value ||
      this.baselineForm.controls.fuelType.value !== this.modificationForm.controls.fuelType.value) {
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
      this.toggleFuelType();
    }
  }

  toggleCombustionEfficiency() {
    if (this.showCombustionEfficiency === false) {
      this.modificationForm.controls.combustionEfficiency.patchValue(this.baselineForm.controls.combustionEfficiency.value);
      this.save();
    }
  }

  toggleFuelType() {
    if (this.showFuelType === false) {
      this.modificationForm.controls.fuelType.patchValue(this.baselineForm.controls.fuelType.value);
      this.modificationForm.controls.fuel.patchValue(this.baselineForm.controls.fuel.value);
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
    // not needed unless we enable baseline fields
    // let tmpBaselineBoilerInput: BoilerInput = this.boilerService.initObjFromForm(this.baselineForm);
    // this.ssmt.boilerInput = tmpBaselineBoilerInput;
    let stackLossInput: StackLossInput = this.ssmt.modifications[this.exploreModIndex].ssmt.boilerInput.stackLossInput;
    let tmpModificationBoilerInput: BoilerInput = this.boilerService.initObjFromForm(this.modificationForm);
    tmpModificationBoilerInput.stackLossInput = stackLossInput;
    this.ssmt.modifications[this.exploreModIndex].ssmt.boilerInput = tmpModificationBoilerInput;
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
