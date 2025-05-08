import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivatedSludgeData, AeratorPerformanceData, SystemBasics, WasteWater, WasteWaterOperations } from '../../../shared/models/waste-water';
import { ActivatedSludgeFormService } from '../../activated-sludge-form/activated-sludge-form.service';
import { AeratorPerformanceFormService, AeratorPerformanceWarnings } from '../../aerator-performance-form/aerator-performance-form.service';
import { SystemBasicsService } from '../../system-basics/system-basics.service';
import { WasteWaterOperationsService } from '../../waste-water-operations/waste-water-operations.service';
import { WasteWaterService } from '../../waste-water.service';

@Component({
    selector: 'app-setup-tabs',
    templateUrl: './setup-tabs.component.html',
    styleUrls: ['./setup-tabs.component.css'],
    standalone: false
})
export class SetupTabsComponent implements OnInit {

  setupTab: string;
  setupTabSub: Subscription;

  operationsClassStatus: Array<string> = [];
  systemBasicsClassStatus: Array<string> = [];
  aeratorPerformanceClassStatus: Array<string> = [];
  activatedSludgeClassStatus: Array<string> = [];
  systemBasicsBadge: { display: boolean, hover: boolean } = { display: false, hover: false }
  operationsBadge: { display: boolean, hover: boolean } = { display: false, hover: false }
  aeratorPerformanceBadge: { display: boolean, hover: boolean } = { display: false, hover: false }
  activatedSludgeBadge: { display: boolean, hover: boolean } = { display: false, hover: false }

  wasteWaterSub: Subscription;
  canContinue: boolean = true;
  constructor(private wasteWaterService: WasteWaterService, private aeratorPerformanceFormService: AeratorPerformanceFormService,
    private activatedSludgeFormService: ActivatedSludgeFormService, private systemBasicsService: SystemBasicsService, private operationsService: WasteWaterOperationsService) { }

  ngOnInit(): void {
    this.setupTabSub = this.wasteWaterService.setupTab.subscribe(val => {
      this.setupTab = val;
      let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
      this.setSystemBasicsStatus(wasteWater.systemBasics);
      this.setActivatedSludgeStatus(wasteWater.systemBasics, wasteWater.baselineData.activatedSludgeData, wasteWater.baselineData.operations);
      this.setAeratorPerformanceStatus(wasteWater.systemBasics, wasteWater.baselineData.activatedSludgeData, wasteWater.baselineData.aeratorPerformanceData, wasteWater.baselineData.operations);
      this.setOperationsStatus(wasteWater.baselineData.operations);
      this.getCanContinue();
    });

    this.wasteWaterSub = this.wasteWaterService.wasteWater.subscribe(val => {
      this.setSystemBasicsStatus(val.systemBasics);
      this.setActivatedSludgeStatus(val.systemBasics, val.baselineData.activatedSludgeData, val.baselineData.operations);
      this.setAeratorPerformanceStatus(val.systemBasics, val.baselineData.activatedSludgeData, val.baselineData.aeratorPerformanceData, val.baselineData.operations);
      this.setOperationsStatus(val.baselineData.operations);
      this.getCanContinue();
    });
  }

  ngOnDestroy() {
    this.setupTabSub.unsubscribe();
    this.wasteWaterSub.unsubscribe();
  }

  changeSetupTab(str: string) {
    if (str == 'baseline') {
      this.wasteWaterService.setupTab.next(str);
    } else if (str == 'activated-sludge') {
      let canChange: boolean = (this.activatedSludgeClassStatus.includes("disabled") == false);
      if (canChange) {
        this.wasteWaterService.setupTab.next(str);
      }
    } else if (str == 'aerator-performance') {
      let canChange: boolean = (this.aeratorPerformanceClassStatus.includes("disabled") == false);
      if (canChange) {
        this.wasteWaterService.setupTab.next(str);
      }
    } else if (str == 'operations') {
      let canChange: boolean = (this.operationsClassStatus.includes("disabled") == false);
      if (canChange) {
        this.wasteWaterService.setupTab.next(str);
      }
    }
    this.getCanContinue();
  }

  setSystemBasicsStatus(systemBasics: SystemBasics) {
    let form: UntypedFormGroup = this.systemBasicsService.getFormFromObj(systemBasics);
    if (form.invalid) {
      this.systemBasicsClassStatus = ['missing-data'];
    } else {
      this.systemBasicsClassStatus = ['success'];
    }
    if (this.setupTab == 'baseline') {
      this.systemBasicsClassStatus.push('active');
    }
  }

  setOperationsStatus(operations: WasteWaterOperations) {
    let form: UntypedFormGroup = this.operationsService.getFormFromObj(operations);
    if (form.invalid) {
      this.operationsClassStatus = ['missing-data'];
    } else {
      this.operationsClassStatus = ['success'];
    }
    if (this.setupTab == 'operations') {
      this.operationsClassStatus.push('active');
    }
  }

  setActivatedSludgeStatus(systemBasics: SystemBasics, activatedSludgeData: ActivatedSludgeData, operations: WasteWaterOperations) {
   // let systemBasicsForm: FormGroup = this.systemBasicsService.getFormFromObj(systemBasics);
    let operationForm: UntypedFormGroup = this.operationsService.getFormFromObj(operations);
    let form: UntypedFormGroup = this.activatedSludgeFormService.getFormFromObj(activatedSludgeData);
    if (operationForm.invalid) {
      this.activatedSludgeClassStatus = ['disabled'];
    } else if (form.invalid) {
      this.activatedSludgeClassStatus = ['missing-data'];
    } else {
      this.activatedSludgeClassStatus = ['success'];
    }
    if (this.setupTab == 'activated-sludge') {
      this.activatedSludgeClassStatus.push('active');
    }
  }

  setAeratorPerformanceStatus(systemBasics: SystemBasics, activatedSludgeData: ActivatedSludgeData, aeratorPerformanceData: AeratorPerformanceData, operations: WasteWaterOperations) {
    //let systemBasicsForm: FormGroup = this.systemBasicsService.getFormFromObj(systemBasics);
    let operationForm: UntypedFormGroup = this.operationsService.getFormFromObj(operations);
    let activatedSludgeForm: UntypedFormGroup = this.activatedSludgeFormService.getFormFromObj(activatedSludgeData);
    let form: UntypedFormGroup = this.aeratorPerformanceFormService.getFormFromObj(aeratorPerformanceData);
    let warnings: AeratorPerformanceWarnings = this.aeratorPerformanceFormService.checkWarnings(aeratorPerformanceData);
    if (activatedSludgeForm.invalid || operationForm.invalid) {
      this.aeratorPerformanceClassStatus = ['disabled'];
    } else if (form.invalid) {
      this.aeratorPerformanceClassStatus = ['missing-data'];
    } else if (warnings.Speed) {
      this.aeratorPerformanceClassStatus = ['input-error'];
    } else {
      this.aeratorPerformanceClassStatus = ['success'];
    }
    if (this.setupTab == 'aerator-performance') {
      this.aeratorPerformanceClassStatus.push('active');
    }
  }

  showTooltip(badge: { display: boolean, hover: boolean }) {
    badge.hover = true;
    setTimeout(() => {
      this.checkHover(badge);
    }, 1000);
  }

  hideTooltip(badge: { display: boolean, hover: boolean }) {
    badge.hover = false;
    badge.display = false;
  }

  checkHover(badge: { display: boolean, hover: boolean }) {
    if (badge.hover) {
      badge.display = true;
    } else {
      badge.display = false;
    }
  }

  continue() {
    this.wasteWaterService.continue();
  }

  back() {
    this.wasteWaterService.back();
  }

  getCanContinue(): boolean {
    if (this.setupTab === 'baseline') {
      this.canContinue = true;
    } else if (this.setupTab === 'operations') {
      this.canContinue = (this.operationsClassStatus.includes("missing-data") == false);
    } else if (this.setupTab === 'activated-sludge') {
      this.canContinue = (this.activatedSludgeClassStatus.includes("missing-data") == false);
    } else if (this.setupTab === 'aerator-performance') {
      this.canContinue = (this.aeratorPerformanceClassStatus.includes("missing-data") == false);
    } 
    return this.canContinue;
  }
}
