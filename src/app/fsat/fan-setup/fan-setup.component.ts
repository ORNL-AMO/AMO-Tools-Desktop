import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FanSetupService } from './fan-setup.service';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { FanSetup, FSAT } from '../../shared/models/fans';
import { HelpPanelService } from '../help-panel/help-panel.service';
import { FanTypes, Drives } from '../fanOptions';
import { CompareService } from '../compare.service';
import { Settings } from '../../shared/models/settings';
import { FsatWarningService } from '../fsat-warning.service';
import { FanEfficiencyInputs } from '../../calculator/fans/fan-efficiency/fan-efficiency.service';
import { FsatService } from '../fsat.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
@Component({
  selector: 'app-fan-setup',
  templateUrl: './fan-setup.component.html',
  styleUrls: ['./fan-setup.component.css']
})
export class FanSetupComponent implements OnInit {
  @Input()
  inSetup: boolean;
  @Input()
  selected: boolean;
  @Input()
  fanSetup: FanSetup;
  @Input()
  modificationIndex: number;
  @Output('emitSave')
  emitSave = new EventEmitter<FanSetup>();
  @Input()
  settings: Settings;
  @Input()
  fsat: FSAT;
  @Input()
  baseline: boolean;
  @Input()
  containerHeight: number;

  condenseDropDown: boolean;


  drives: Array<{ display: string, value: number }>;
  fanTypes: Array<{ display: string, value: number }>;
  fanForm: UntypedFormGroup;
  fanSpeedError: string = null;
  idString: string;
  constructor(private fsatWarningService: FsatWarningService, private fsatService: FsatService, private convertUnitsService: ConvertUnitsService, private compareService: CompareService, private fanSetupService: FanSetupService, private helpPanelService: HelpPanelService) {
  }

  ngOnInit() {
    if (!this.baseline) {
      this.idString = 'fsat_modification_' + this.modificationIndex;
    }
    else {
      this.idString = 'fsat_baseline';
    }
    this.drives = Drives;
    this.fanTypes = FanTypes;
    this.init();
    if (!this.selected) {
      this.disableForm();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.containerHeight) {
      this.initCondenseDropDown();
    }
    if (changes.selected && !changes.selected.firstChange) {
      if (this.selected) {
        this.enableForm();
      } else {
        this.disableForm();
      }
    }
    if (changes.modificationIndex && !changes.modificationIndex.firstChange) {
      this.init();
    }
  }

  initCondenseDropDown() {
    if (this.containerHeight < 325) {
      this.condenseDropDown = true;
    }
    else {
      this.condenseDropDown = false;
    }
  }

  init() {
    if (this.fanSetup.drive !== 4) {
      this.fanSetup.specifiedDriveEfficiency = 100;
    }
    else {
      this.fanSetup.specifiedDriveEfficiency = this.fanSetup.specifiedDriveEfficiency || 100;
    }
    this.fanForm = this.fanSetupService.getFormFromObj(this.fanSetup, !this.baseline);
    this.checkForWarnings();
  }
  disableForm() {
    this.fanForm.controls.fanType.disable();
    this.fanForm.controls.drive.disable();
    if (this.fanForm.controls.fanType.value !== 12) {
      this.fanForm.controls.fanEfficiency.disable();
    }
  }

  enableForm() {
    this.fanForm.controls.fanType.enable();
    this.fanForm.controls.drive.enable();
  }

  focusField(str: string) {
    this.helpPanelService.currentField.next(str);
  }

  // changeFanType() {
  //   if (this.fanForm.controls.fanType.value == 12) {
  //     this.fanForm.controls.fanEfficiency.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
  //     this.fanForm.controls.fanEfficiency.reset(this.fanForm.controls.fanEfficiency.value);
  //     this.fanForm.controls.fanEfficiency.markAsDirty();
  //   } else {
  //     this.fanForm.controls.fanEfficiency.setValidators([]);
  //     this.fanForm.controls.fanEfficiency.reset(this.fanForm.controls.fanEfficiency.value);
  //     this.fanForm.controls.fanEfficiency.markAsDirty();
  //   }
  //   this.save();
  // }

  changeDriveType() {
    if (this.fanForm.controls.drive.value === 4) {
      this.fanForm.controls.specifiedDriveEfficiency.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
      this.fanForm.controls.specifiedDriveEfficiency.reset(this.fanForm.controls.specifiedDriveEfficiency.value);
      this.fanForm.controls.specifiedDriveEfficiency.markAsDirty();
    } else {
      this.fanForm.controls.specifiedDriveEfficiency.setValidators([]);
      this.fanForm.controls.specifiedDriveEfficiency.reset(this.fanForm.controls.specifiedDriveEfficiency.value);
      this.fanForm.controls.specifiedDriveEfficiency.markAsDirty();
    }
    this.save();
  }


  checkForWarnings() {
    let warnings: { fanSpeedError: string } = this.fsatWarningService.checkFanWarnings(this.fanSetup);
    this.fanSpeedError = warnings.fanSpeedError;
    // this.fanEfficiencyError = warnings.fanEfficiencyError;
    // this.specifiedDriveEfficiencyError = warnings.specifiedDriveEfficiencyError;
  }

  save() {
    this.fanSetup = this.fanSetupService.getObjFromForm(this.fanForm);
    if (this.fanSetup.drive !== 4) {
      this.fanSetup.specifiedDriveEfficiency = 100;
    }
    this.checkForWarnings();
    this.emitSave.emit(this.fanSetup);
  }

  enableFanType() {
    this.fanForm.controls.fanType.patchValue(this.compareService.baselineFSAT.fanSetup.fanType);
    this.fanForm.controls.fanType.enable();
    this.getFanEfficiency();
  }

  disableFanType() {
    let calculatedEfficiency: number = this.fsatService.getResults(this.compareService.baselineFSAT, true, this.settings).fanEfficiency;
    calculatedEfficiency = this.convertUnitsService.roundVal(calculatedEfficiency, 2);
    this.fanForm.controls.fanEfficiency.patchValue(calculatedEfficiency);
    this.fanForm.controls.fanType.patchValue(12);
    this.save();
  }

  getFanEfficiency() {
    let tmpEfficiency: number = this.calcFanEfficiency();
    this.fanForm.controls.fanEfficiency.patchValue(tmpEfficiency);
    this.save();
  }

  calcFanEfficiency() {
    let inputs: FanEfficiencyInputs = {
      fanType: this.fanForm.controls.fanType.value,
      fanSpeed: this.fsat.fanSetup.fanSpeed,
      inletPressure: this.fsat.fieldData.inletPressure,
      outletPressure: this.fsat.fieldData.outletPressure,
      flowRate: this.fsat.fieldData.flowRate,
      compressibility: this.fsat.fieldData.compressibilityFactor
    };
    let tmpEfficiency: number = this.fsatService.optimalFanEfficiency(inputs, this.settings);
    tmpEfficiency = this.convertUnitsService.roundVal(tmpEfficiency, 2);
    return tmpEfficiency;
  }

  canCompare() {
    if (this.compareService.baselineFSAT && this.compareService.modifiedFSAT && !this.inSetup) {
      return true;
    } else {
      return false;
    }
  }

  isFanTypeDifferent() {
    if (this.canCompare()) {
      return this.compareService.isFanTypeDifferent();
    } else {
      return false;
    }
  }

  isFanSpeedDifferent() {
    if (this.canCompare()) {
      return this.compareService.isFanSpeedDifferent();
    } else {
      return false;
    }
  }

  isDriveDifferent() {
    if (this.canCompare()) {
      return this.compareService.isDriveDifferent();
    } else {
      return false;
    }
  }

  isFanSpecifiedDifferent() {
    if (this.canCompare()) {
      return this.compareService.isSpecifiedFanEfficiencyDifferent(this.settings);
    } else {
      return false;
    }
  }

  isSpecifiedDriveEfficiencyDifferent() {
    if (this.canCompare()) {
      return this.compareService.isSpecifiedDriveEfficiencyDifferent();
    } else {
      return false;
    }
  }

}
