import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivatedSludgeData, AeratorPerformanceData, WasteWater, WasteWaterData } from '../../../shared/models/waste-water';
import { ActivatedSludgeFormService } from '../../activated-sludge-form/activated-sludge-form.service';
import { AeratorPerformanceFormService, AeratorPerformanceWarnings } from '../../aerator-performance-form/aerator-performance-form.service';
import { CompareService, WasteWaterDifferent } from '../../modify-conditions/compare.service';
import { WasteWaterService } from '../../waste-water.service';

@Component({
  selector: 'app-modify-conditions-tabs',
  templateUrl: './modify-conditions-tabs.component.html',
  styleUrls: ['./modify-conditions-tabs.component.css']
})
export class ModifyConditionsTabsComponent implements OnInit {


  modifyConditionsTab: string;
  modifyConditionsTabSub: Subscription;
  wasteWaterSub: Subscription;

  displayActivatedSludgeTooltip: boolean = false;
  activatedSludgeHover: boolean = false;
  displayAeratorPerformanceTooltip: boolean = false;
  aeratorPerformanceHover: boolean = false;

  activatedSludgeBadgeClass: string;
  aeratorPerformanceBadgeClass: string;
  constructor(private wasteWaterService: WasteWaterService, private aeratorPerformanceFormService: AeratorPerformanceFormService,
    private activatedSludgeFormService: ActivatedSludgeFormService, private compareService: CompareService) { }

  ngOnInit(): void {
    this.modifyConditionsTabSub = this.wasteWaterService.modifyConditionsTab.subscribe(val => {
      this.modifyConditionsTab = val;
    });

    this.wasteWaterSub = this.wasteWaterService.wasteWater.subscribe(val => {
      this.setBadgeClass(val);
    });
  }

  ngOnDestroy() {
    this.modifyConditionsTabSub.unsubscribe();
    this.wasteWaterSub.unsubscribe();
  }

  tabChange(str: string) {
    this.wasteWaterService.modifyConditionsTab.next(str);
  }

  setBadgeClass(wasteWater: WasteWater) {
    let modificationData: WasteWaterData = this.wasteWaterService.getModificationFromId();
    let wasteWaterDifferent: WasteWaterDifferent = this.compareService.compareBaselineModification(wasteWater.baselineData, modificationData)
    this.activatedSludgeBadgeClass = this.setActivatedSludgeBadgeClass(wasteWater.baselineData.activatedSludgeData, wasteWaterDifferent, modificationData);
    this.aeratorPerformanceBadgeClass = this.setAeratorPerformanceBadgeClass(wasteWater.baselineData.aeratorPerformanceData, wasteWaterDifferent, modificationData);
  }

  setActivatedSludgeBadgeClass(baselineData: ActivatedSludgeData, wasteWaterDifferent: WasteWaterDifferent, modificationData?: WasteWaterData): string {
    let badgeStr: string = 'success';
    let baselineForm: FormGroup = this.activatedSludgeFormService.getFormFromObj(baselineData);
    let validBaselineTest = baselineForm.valid;
    let validModTest = true;
    let isDifferent = false;
    if (modificationData) {
      let modificationForm: FormGroup = this.activatedSludgeFormService.getFormFromObj(modificationData.activatedSludgeData);
      validModTest = modificationForm.valid;
      isDifferent = this.compareService.checkHasDifferent(wasteWaterDifferent.activatedSludgeDifferent);
    }
    if (!validBaselineTest || !validModTest) {
      badgeStr = 'missing-data';
    } else if (isDifferent) {
      badgeStr = 'loss-different';
    }
    return badgeStr;
  }

  setAeratorPerformanceBadgeClass(baselineData: AeratorPerformanceData, wasteWaterDifferent: WasteWaterDifferent, modificationData?: WasteWaterData): string {
    let badgeStr: string = 'success';
    let baselineForm: FormGroup = this.aeratorPerformanceFormService.getFormFromObj(baselineData);
    let warnings: AeratorPerformanceWarnings = this.aeratorPerformanceFormService.checkWarnings(baselineData);
    let validBaselineTest = baselineForm.valid;
    let validModTest = true;
    let isDifferent = false;
    let modificationWarnings: AeratorPerformanceWarnings = { Speed: null, OperatingTime: null };
    if (modificationData) {
      let modificationForm: FormGroup = this.aeratorPerformanceFormService.getFormFromObj(modificationData.aeratorPerformanceData);
      modificationWarnings = this.aeratorPerformanceFormService.checkWarnings(modificationData.aeratorPerformanceData);
      validModTest = modificationForm.valid;
      isDifferent = this.compareService.checkHasDifferent(wasteWaterDifferent.aeratorPerformanceDifferent);
    }
    if (!validBaselineTest || !validModTest) {
      badgeStr = 'missing-data';
    } else if (warnings.Speed || modificationWarnings.Speed || warnings.OperatingTime || modificationWarnings.OperatingTime) {
      badgeStr = 'input-error';
    } else if (isDifferent) {
      badgeStr = 'loss-different';
    }
    return badgeStr;
  }


  showTooltip(badge: string) {
    if (badge === 'activated-sludge') {
      this.activatedSludgeHover = true;
    }
    else if (badge === 'aerator-performance') {
      this.aeratorPerformanceHover = true;
    }

    setTimeout(() => {
      this.checkHover();
    }, 1000);
  }

  hideTooltip(badge: string) {
    if (badge === 'activated-sludge') {
      this.activatedSludgeHover = false;
      this.displayActivatedSludgeTooltip = false;
    }
    else if (badge === 'aerator-performance') {
      this.aeratorPerformanceHover = false;
      this.displayAeratorPerformanceTooltip = false;
    }
  }

  checkHover() {
    if (this.activatedSludgeHover) {
      this.displayActivatedSludgeTooltip = true;
    } else {
      this.displayActivatedSludgeTooltip = false;
    }

    if (this.aeratorPerformanceHover) {
      this.displayAeratorPerformanceTooltip = true;
    } else {
      this.displayAeratorPerformanceTooltip = false;
    }
  }
}
