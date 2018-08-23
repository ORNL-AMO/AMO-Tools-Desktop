import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { LossesService } from '../../losses.service';
import { PHAST } from '../../../../shared/models/phast/phast';
import { FormGroup } from '@angular/forms';
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
  badgeClass: Array<string>;
  lossSubscription: Subscription;
  constructor(private lossesService: LossesService, private extendedSurfaceLossesService: ExtendedSurfaceLossesService, private extendedSurfaceCompareService: ExtendedSurfaceCompareService, private cd: ChangeDetectorRef ) { }

  ngOnInit() {
    this.setNumLosses();
    this.lossSubscription = this.lossesService.updateTabs.subscribe(val => {
      this.setNumLosses();
      this.missingData = this.checkMissingData();
      this.isDifferent = this.checkDifferent();
      this.inputError = this.checkWarnings();
      this.setBadgeClass();
    })
    this.badgeHover = false;
  }

  ngOnDestroy(){
    this.lossSubscription.unsubscribe();
  }

  setBadgeClass(){
    let badgeStr: Array<string> = ['success'];
    if(this.missingData){
      badgeStr = ['missing-data'];
    }else if(this.inputError){
      badgeStr = ['input-error'];
    }else if(this.isDifferent && !this.inSetup){
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
  
  checkWarnings(){
    let hasWarning: boolean = false;
    if (this.extendedSurfaceCompareService.baselineSurface) {
      this.extendedSurfaceCompareService.baselineSurface.forEach(loss => {
        let warnings: ExtendedSurfaceWarnings = this.extendedSurfaceLossesService.checkWarnings(loss);
        let tmpHasWarning: boolean = this.extendedSurfaceLossesService.checkWarningsExist(warnings);
        if(tmpHasWarning == true){
          hasWarning = tmpHasWarning;
        }
      })
    }
    if (this.extendedSurfaceCompareService.modifiedSurface) {
      this.extendedSurfaceCompareService.modifiedSurface.forEach(loss => {
        let warnings: ExtendedSurfaceWarnings = this.extendedSurfaceLossesService.checkWarnings(loss);
        let tmpHasWarning: boolean = this.extendedSurfaceLossesService.checkWarningsExist(warnings);
        if(tmpHasWarning == true){
          hasWarning = tmpHasWarning;
        }
      })
    }
    return hasWarning;
  }

  checkMissingData(): boolean {
    let testVal = false;
    if (this.extendedSurfaceCompareService.baselineSurface) {
      this.extendedSurfaceCompareService.baselineSurface.forEach(loss => {
        if (this.checkLossValid(loss) == false) {
          testVal = true;
        }
      })
    }
    if (this.extendedSurfaceCompareService.modifiedSurface && !this.inSetup) {
      this.extendedSurfaceCompareService.modifiedSurface.forEach(loss => {
        if (this.checkLossValid(loss) == false) {
          testVal = true;
        }
      })
    }
    return testVal;
  }


  checkLossValid(loss: ExtendedSurface) {
      let tmpForm: FormGroup = this.extendedSurfaceLossesService.getSurfaceLossForm(loss);
      if (tmpForm.status == 'VALID') {
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
