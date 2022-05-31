import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, HostListener, SimpleChanges } from '@angular/core';
import { OperationsCompareService } from '../operations-compare.service';
import { FormGroup } from '@angular/forms';
import { OperationsService, OperationsWarnings } from '../operations.service';
import { OperatingHours } from '../../../../shared/models/operations';
import { PHAST, PhastCo2SavingsData } from '../../../../shared/models/phast/phast';
import { LossesService } from '../../losses.service';
import { Settings } from '../../../../shared/models/settings';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Co2SavingsPhastService, PhastCo2SavingsDifferent } from '../co2-savings-phast/co2-savings-phast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-operations-form',
  templateUrl: './operations-form.component.html',
  styleUrls: ['./operations-form.component.css']
})
export class OperationsFormComponent implements OnInit {
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Output('saveEmit')
  saveEmit = new EventEmitter<boolean>();
  @Input()
  operationsForm: FormGroup;
  @Input()
  baselineSelected: boolean;
  @Input()
  isBaseline: boolean;
  @Input()
  phast: PHAST;
  @Input()
  settings: Settings;
  @Input()
  inSetup: boolean;
  @Input()
  selected: boolean;
  @Input()
  modificationIndex: number;

  @ViewChild('lossForm', { static: false }) lossForm: ElementRef;
  @ViewChild('operatingCostsModal', { static: false }) public operatingCostsModal: ModalDirective;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }
  
  formWidth: number;
  showOperatingHoursModal: boolean = false;
  showOperatingCostsModal: boolean = false;
  
  co2SavingsDifferent: PhastCo2SavingsDifferent;
  co2SavingsDifferentSubscription: Subscription;
  co2SavingsFormDisabled: boolean;
  co2SavingsData: PhastCo2SavingsData;

  warnings: OperationsWarnings;
  idString: string;
  constructor(private operationsCompareService: OperationsCompareService, private operationsService: OperationsService, private lossesService: LossesService,
    private phastCO2SavingService: Co2SavingsPhastService) { }

  ngOnInit() {
    this.co2SavingsDifferentSubscription = this.operationsCompareService.co2SavingsDifferent.subscribe(val => {
      this.co2SavingsDifferent = val;
    });
    if (!this.isBaseline) {
      this.idString = '_modification';
    }
    else {
      this.idString = '_baseline';
    }
    this.init();
  }

  ngOnDestroy() {
    this.operationsCompareService.co2SavingsDifferent.next(this.phastCO2SavingService.getDefaultCO2Different());
    this.co2SavingsDifferentSubscription.unsubscribe();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setOpHoursModalWidth();
    }, 100)
  }

  init(){
    this.setCo2SavingsData();
    this.checkWarnings();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.modificationIndex && !changes.modificationIndex.firstChange) {
      this.init();
    }
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  focusOut() {
    this.changeField.emit('default');
  }

  checkWarnings() {
    let tmpHours: OperatingHours = this.operationsService.getOperatingDataFromForm(this.operationsForm).hours;
    this.warnings = this.operationsService.checkWarnings(tmpHours);
  }

  save() {
    this.checkWarnings();
    this.saveEmit.emit(true);
    this.isCo2SavingsDifferent();
  }

  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
    this.lossesService.modalOpen.next(false);
  }

  openOperatingHoursModal() {
    this.showOperatingHoursModal = true;
    this.lossesService.modalOpen.next(true);
  }

  updateOperatingHours(oppHours: OperatingHours) {
    this.phast.operatingHours = oppHours;
    this.operationsForm.controls.hoursPerYear.patchValue(oppHours.hoursPerYear);
    this.save();
    this.closeOperatingHoursModal();
  }

  initOperatingCostsModal() {
    this.showOperatingCostsModal = true;
    // modalOpen enables a style onthe parent component to keep the modal zindex in front of all UI
    this.lossesService.modalOpen.next(true);
    this.operatingCostsModal.show();
  }

  hideOperatingCostsModal(mixedFuelCosts: number) {
    // mixedFuelCosts is our $event that is emitted up to THIS component from operating-costs-modal setMixedFuelCosts()
    if (mixedFuelCosts) {
      this.operationsForm.controls.fuelCost.patchValue(mixedFuelCosts);
      this.save();
    }
    this.operatingCostsModal.hide();
    this.showOperatingCostsModal = false;
    this.lossesService.modalOpen.next(false);
  }

  setOpHoursModalWidth() {
    if (this.lossForm.nativeElement.clientWidth) {
      this.formWidth = this.lossForm.nativeElement.clientWidth;
    }
  }

  canCompare() {
    if (this.operationsCompareService.baseline && this.operationsCompareService.modification && !this.inSetup) {
      return true;
    } else {
      return false;
    }
  }

  compareHoursPerYear(): boolean {
    if (this.canCompare()) {
      return this.operationsCompareService.compareHoursPerYear();
    } else {
      return false;
    }
  }
  compareFuelCost(): boolean {
    if (this.canCompare()) {
      return this.operationsCompareService.compareFuelCost();
    } else {
      return false;
    }
  }

  compareCoalCarbonCost(): boolean {
    if (this.canCompare()) {
      return this.operationsCompareService.compareCoalCarbonCost();
    } else {
      return false;
    }
  }

  compareElectrodeCost(): boolean {
    if (this.canCompare()) {
      return this.operationsCompareService.compareElectrodeCost();
    } else {
      return false;
    }
  }

  compareOtherFuelCost(): boolean {
    if (this.canCompare()) {
      return this.operationsCompareService.compareOtherFuelCost();
    } else {
      return false;
    }
  }

  compareSteamCost(): boolean {
    if (this.canCompare()) {
      return this.operationsCompareService.compareSteamCost();
    } else {
      return false;
    }
  }

  isCo2SavingsDifferent() {
    if (this.canCompare()) {
      this.operationsCompareService.isCo2SavingsDifferent(this.settings);
    } else {
      this.operationsCompareService.co2SavingsDifferent.next(this.phastCO2SavingService.getDefaultCO2Different());
    }
  }
  
  compareElectricityCost(): boolean {
    if (this.canCompare()) {
      return this.operationsCompareService.compareElectricityCost();
    } else {
      return false;
    }
  }

  updateCo2SavingsData(co2SavingsData?: PhastCo2SavingsData) {
    this.phast.co2SavingsData = co2SavingsData;
    this.save();
  }

  setCo2SavingsData() {
    if (this.phast.co2SavingsData) {
      this.co2SavingsData = this.phast.co2SavingsData;
      this.co2SavingsData.energyType = 'electricity';
      if (this.settings.energySourceType == 'Fuel' || this.settings.energySourceType == 'Steam') {
        this.co2SavingsData.energyType = 'fuel';
      }
    } else {
      let co2SavingsData: PhastCo2SavingsData = this.phastCO2SavingService.getCo2SavingsDataFromSettingsObject(this.settings);
      this.co2SavingsData = co2SavingsData;
    }
  }
}
