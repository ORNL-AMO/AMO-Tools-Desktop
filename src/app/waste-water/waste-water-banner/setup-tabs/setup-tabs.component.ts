import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivatedSludgeData, AeratorPerformanceData, SystemBasics, WasteWater } from '../../../shared/models/waste-water';
import { ActivatedSludgeFormService } from '../../activated-sludge-form/activated-sludge-form.service';
import { AeratorPerformanceFormService, AeratorPerformanceWarnings } from '../../aerator-performance-form/aerator-performance-form.service';
import { SystemBasicsService } from '../../system-basics/system-basics.service';
import { WasteWaterService } from '../../waste-water.service';

@Component({
  selector: 'app-setup-tabs',
  templateUrl: './setup-tabs.component.html',
  styleUrls: ['./setup-tabs.component.css']
})
export class SetupTabsComponent implements OnInit {

  setupTab: string;
  setupTabSub: Subscription;

  systemBasicsClassStatus: Array<string> = [];
  aeratorPerformanceClassStatus: Array<string> = [];
  activatedSludgeClassStatus: Array<string> = [];
  systemBasicsBadge: { display: boolean, hover: boolean } = { display: false, hover: false }
  aeratorPerformanceBadge: { display: boolean, hover: boolean } = { display: false, hover: false }
  activatedSludgeBadge: { display: boolean, hover: boolean } = { display: false, hover: false }

  wasteWaterSub: Subscription;
  constructor(private wasteWaterService: WasteWaterService, private aeratorPerformanceFormService: AeratorPerformanceFormService,
    private activatedSludgeFormService: ActivatedSludgeFormService, private systemBasicsService: SystemBasicsService) { }

  ngOnInit(): void {
    this.setupTabSub = this.wasteWaterService.setupTab.subscribe(val => {
      this.setupTab = val;
      let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
      this.setSystemBasicsStatus(wasteWater.systemBasics);
      this.setActivatedSludgeStatus(wasteWater.systemBasics, wasteWater.baselineData.activatedSludgeData);
      this.setAeratorPerformanceStatus(wasteWater.systemBasics, wasteWater.baselineData.activatedSludgeData, wasteWater.baselineData.aeratorPerformanceData);
    });

    this.wasteWaterSub = this.wasteWaterService.wasteWater.subscribe(val => {
      this.setSystemBasicsStatus(val.systemBasics);
      this.setActivatedSludgeStatus(val.systemBasics, val.baselineData.activatedSludgeData);
      this.setAeratorPerformanceStatus(val.systemBasics, val.baselineData.activatedSludgeData, val.baselineData.aeratorPerformanceData);
    });
  }

  ngOnDestroy() {
    this.setupTabSub.unsubscribe();
    this.wasteWaterSub.unsubscribe();
  }

  changeSetupTab(str: string) {
    if(str == 'system-basics'){
      this.wasteWaterService.setupTab.next(str);
    }else if(str == 'activated-sludge'){
      let canChange: boolean = (this.activatedSludgeClassStatus.includes("disabled") == false);
      if(canChange){
        this.wasteWaterService.setupTab.next(str);
      }
    }else if(str == 'aerator-performance'){
      let canChange: boolean = (this.aeratorPerformanceClassStatus.includes("disabled") == false);
      if(canChange){
        this.wasteWaterService.setupTab.next(str);
      }
    }
  }

  setSystemBasicsStatus(systemBasics: SystemBasics) {
    let form: FormGroup = this.systemBasicsService.getFormFromObj(systemBasics);
    if (form.invalid) {
      this.systemBasicsClassStatus = ['missing-data'];
    } else {
      this.systemBasicsClassStatus = ['success'];
    }
    if (this.setupTab == 'system-basics') {
      this.systemBasicsClassStatus.push('active');
    }
  }

  setActivatedSludgeStatus(systemBasics: SystemBasics, activatedSludgeData: ActivatedSludgeData) {
    let systemBasicsForm: FormGroup = this.systemBasicsService.getFormFromObj(systemBasics);
    let form: FormGroup = this.activatedSludgeFormService.getFormFromObj(activatedSludgeData);
    if (systemBasicsForm.invalid) {
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

  setAeratorPerformanceStatus(systemBasics: SystemBasics, activatedSludgeData: ActivatedSludgeData, aeratorPerformanceData: AeratorPerformanceData) {
    let systemBasicsForm: FormGroup = this.systemBasicsService.getFormFromObj(systemBasics);
    let activatedSludgeForm: FormGroup = this.activatedSludgeFormService.getFormFromObj(activatedSludgeData);
    let form: FormGroup = this.aeratorPerformanceFormService.getFormFromObj(aeratorPerformanceData);
    let warnings: AeratorPerformanceWarnings = this.aeratorPerformanceFormService.checkWarnings(aeratorPerformanceData);
    if (systemBasicsForm.invalid || activatedSludgeForm.invalid) {
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
}
