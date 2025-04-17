import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges, ViewChild, HostListener, ElementRef } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
import { LossTab } from '../../../tabs';
import { OperatingHours } from '../../../../shared/models/operations';
import { LossesService } from '../../../losses/losses.service';

@Component({
    selector: 'app-explore-operations-form',
    templateUrl: './explore-operations-form.component.html',
    styleUrls: ['./explore-operations-form.component.css'],
    standalone: false
})
export class ExploreOperationsFormComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Input()
  settings: Settings;
  @Input()
  exploreModIndex: number;
  @Output('changeTab')
  changeTab = new EventEmitter<LossTab>();

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }

  formWidth: number;
  showOperatingHoursModal: boolean = false;

  showOpHours: boolean = false;
  showFuelCosts: boolean = false;
  showSteamCosts: boolean = false;
  showElectricityCosts: boolean = false;
  constructor(private lossesService: LossesService) { }

  ngOnInit() {
    this.initElectricityCosts();
    this.initSteamCosts();
    this.initFuelCosts();
    this.initOpHours();
    this.initAllOps();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.exploreModIndex) {
      if (!changes.exploreModIndex.isFirstChange()) {
        this.initElectricityCosts();
        this.initSteamCosts();
        this.initFuelCosts();
        this.initOpHours();
        this.initAllOps();
      }
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setOpHoursModalWidth();
    }, 100);
  }

  initElectricityCosts() {
    if (this.phast.operatingCosts.electricityCost !== this.phast.modifications[this.exploreModIndex].phast.operatingCosts.electricityCost) {
      this.showElectricityCosts = true;
    } else {
      this.showElectricityCosts = false;
    }
  }

  initSteamCosts() {
    if (this.phast.operatingCosts.steamCost !== this.phast.modifications[this.exploreModIndex].phast.operatingCosts.steamCost) {
      this.showSteamCosts = true;
    } else {
      this.showSteamCosts = false;
    }
  }

  initFuelCosts() {
    if (this.phast.operatingCosts.fuelCost !== this.phast.modifications[this.exploreModIndex].phast.operatingCosts.fuelCost) {
      this.showFuelCosts = true;
    } else {
      this.showFuelCosts = false;
    }
  }

  initOpHours() {
    if (this.phast.operatingHours.hoursPerYear !== this.phast.modifications[this.exploreModIndex].phast.operatingHours.hoursPerYear) {
      this.showOpHours = true;
    } else {
      this.showOpHours = false;
    }
  }
  
  initAllOps() {
    if (this.showElectricityCosts || this.showFuelCosts || this.showSteamCosts || this.showOpHours) {
      this.phast.modifications[this.exploreModIndex].exploreOppsShowOperations = { hasOpportunity: true, display: 'Adjust Operational Data' };
    } else {
      this.phast.modifications[this.exploreModIndex].exploreOppsShowOperations = { hasOpportunity: false, display: 'Adjust Operational Data' }; 
    }
  }

  toggleElectricityCosts() {
    if (this.showElectricityCosts === false) {
      this.phast.modifications[this.exploreModIndex].phast.operatingCosts.electricityCost = this.phast.operatingCosts.electricityCost;
      this.calculate();
    }
  }

  toggleSteamCosts() {
    if (this.showSteamCosts === false) {
      this.phast.modifications[this.exploreModIndex].phast.operatingCosts.steamCost = this.phast.operatingCosts.steamCost;
      this.calculate();
    }
  }

  toggleFuelCosts() {
    if (this.showFuelCosts === false) {
      this.phast.modifications[this.exploreModIndex].phast.operatingCosts.fuelCost = this.phast.operatingCosts.fuelCost;
      this.calculate();
    }
  }

  toggleOpHours() {
    if (this.showOpHours === false) {
      this.phast.modifications[this.exploreModIndex].phast.operatingHours.hoursPerYear = this.phast.operatingHours.hoursPerYear;
      this.calculate();
    }
  }

  toggleOperations() {
    if (this.phast.modifications[this.exploreModIndex].exploreOppsShowOperations.hasOpportunity === false) {
      this.showOpHours = false;
      this.showElectricityCosts = false;
      this.showSteamCosts = false;
      this.showFuelCosts = false;
      this.toggleOpHours();
      this.toggleFuelCosts();
      this.toggleSteamCosts();
      this.toggleElectricityCosts();
    }
  }

  focusField(str: string) {
    this.changeField.emit(str);
    this.changeTab.emit({
      tabName: 'Operations',
      step: 1,
      componentStr: 'operations'
    });
  }

  calculate() {
    this.emitCalculate.emit(true);
  }

  focusOut() {

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
    this.phast.modifications[this.exploreModIndex].phast.operatingHours = oppHours;
    this.calculate();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth() {
    if (this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }
}
