import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { LossesService } from '../../losses.service';
import { PHAST } from '../../../../shared/models/phast/phast';
import { UntypedFormGroup } from '@angular/forms';
import { ExtendedSurfaceLossesService, ExtendedSurfaceWarnings } from '../../extended-surface-losses/extended-surface-losses.service';
import { ExtendedSurfaceCompareService } from '../../extended-surface-losses/extended-surface-compare.service';
import { ExtendedSurface } from '../../../../shared/models/phast/losses/extendedSurface';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-extended-surface-tab',
  templateUrl: './extended-surface-tab.component.html',
  styleUrls: ['./extended-surface-tab.component.css']
})
export class ExtendedSurfaceTabComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  inSetup: boolean;

  badgeHover: boolean;
  displayTooltip: boolean;

  numLosses: number = 0;
  inputError: boolean;
  missingData: boolean;
  isDifferent: boolean;
  badgeClass: Array<string> = [];
  lossSubscription: Subscription;
  constructor(private lossesService: LossesService, private extendedSurfaceLossesService: ExtendedSurfaceLossesService, private extendedSurfaceCompareService: ExtendedSurfaceCompareService, private cd: ChangeDetectorRef ) { }

  ngOnInit() {
    this.setNumLosses();
    this.lossSubscription = this.lossesService.updateTabs.subscribe(val => {
      this.setNumLosses();
      let dataCheck: { missingData: boolean, hasWarning: boolean } = this.checkLossData();
      this.missingData = dataCheck.missingData;
      this.isDifferent = this.checkDifferent();
      this.inputError = dataCheck.hasWarning;
      this.setBadgeClass();
    });
    this.badgeHover = false;
  }

  ngOnDestroy() {
    this.lossSubscription.unsubscribe();
  }

  setBadgeClass() {
    let badgeStr: Array<string> = ['success'];
    if (this.missingData) {
      badgeStr = ['missing-data'];
    }else if (this.inputError) {
      badgeStr = ['input-error'];
    }else if (this.isDifferent && !this.inSetup) {
      badgeStr = ['loss-different'];
    }
    this.badgeClass = badgeStr;
    this.cd.detectChanges();
  }

  setNumLosses() {
    if (this.phast.losses) {
      if (this.phast.losses.extendedSurfaces) {
        this.numLosses = this.phast.losses.extendedSurfaces.length;
      }
    }
  }


  checkLossData(): { missingData: boolean, hasWarning: boolean } {
    let missingData = false;
    let hasWarning: boolean = false;
    if (this.extendedSurfaceCompareService.baselineSurface) {
      this.extendedSurfaceCompareService.baselineSurface.forEach(loss => {
        if (this.checkLossValid(loss) === false) {
          missingData = true;
        }
        let warnings: ExtendedSurfaceWarnings = this.extendedSurfaceLossesService.checkWarnings(loss);
        let tmpHasWarning: boolean = this.extendedSurfaceLossesService.checkWarningsExist(warnings);
        if (tmpHasWarning === true) {
          hasWarning = tmpHasWarning;
        }
      });
    }
    if (this.extendedSurfaceCompareService.modifiedSurface && !this.inSetup) {
      this.extendedSurfaceCompareService.modifiedSurface.forEach(loss => {
        if (this.checkLossValid(loss) === false) {
          missingData = true;
        }
        let warnings: ExtendedSurfaceWarnings = this.extendedSurfaceLossesService.checkWarnings(loss);
        let tmpHasWarning: boolean = this.extendedSurfaceLossesService.checkWarningsExist(warnings);
        if (tmpHasWarning === true) {
          hasWarning = tmpHasWarning;
        }
      });
    }
    return { missingData: missingData, hasWarning: hasWarning };
  }


  checkLossValid(loss: ExtendedSurface) {
      let tmpForm: UntypedFormGroup = this.extendedSurfaceLossesService.getSurfaceLossForm(loss);
      if (tmpForm.status === 'VALID') {
        return true;
      } else {
        return false;
      }
  }

  checkDifferent() {
    if (this.extendedSurfaceCompareService.baselineSurface && this.extendedSurfaceCompareService.modifiedSurface) {
      return this.extendedSurfaceCompareService.compareAllLosses();
    }
  }

  showTooltip() {
    this.badgeHover = true;

    setTimeout(() => {
      this.checkHover();
    }, 1000);
  }

  hideTooltip() {
    this.badgeHover = false;
    this.displayTooltip = false;
  }

  checkHover() {
    if (this.badgeHover) {
      this.displayTooltip = true;
    }
    else {
      this.displayTooltip = false;
    }
  }
}
