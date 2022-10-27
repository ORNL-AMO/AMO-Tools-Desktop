import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { ExtendedSurfaceCompareService } from '../extended-surface-compare.service';
import { Settings } from '../../../../shared/models/settings';
import { UntypedFormGroup } from '@angular/forms';
import { ExtendedSurfaceWarnings, ExtendedSurfaceLossesService } from '../extended-surface-losses.service';
import { ExtendedSurface } from '../../../../shared/models/phast/losses/extendedSurface';
@Component({
  selector: 'app-extended-surface-losses-form',
  templateUrl: './extended-surface-losses-form.component.html',
  styleUrls: ['./extended-surface-losses-form.component.css']
})
export class ExtendedSurfaceLossesFormComponent implements OnInit {
  @Input()
  lossesForm: UntypedFormGroup;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Input()
  baselineSelected: boolean;
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Output('saveEmit')
  saveEmit = new EventEmitter<boolean>();
  @Input()
  lossIndex: number;
  @Input()
  settings: Settings;
  @Output('inputError')
  inputError = new EventEmitter<boolean>();
  @Input()
  inSetup: boolean;
  @Input()
  isBaseline: boolean;

  warnings: ExtendedSurfaceWarnings;
  idString: string;
  constructor(private extendedSurfaceCompareService: ExtendedSurfaceCompareService, private extendedLossesSurfaceService: ExtendedSurfaceLossesService) { }


  ngOnInit() {
    if (!this.isBaseline) {
      this.idString = '_modification_' + this.lossIndex;
    }
    else {
      this.idString = '_baseline_' + this.lossIndex;
    }
    this.checkWarnings();
  }

  checkWarnings() {
    let tmpLoss: ExtendedSurface = this.extendedLossesSurfaceService.getSurfaceLossFromForm(this.lossesForm);
    this.warnings = this.extendedLossesSurfaceService.checkWarnings(tmpLoss);
    let hasWarning: boolean = this.extendedLossesSurfaceService.checkWarningsExist(this.warnings);
    this.inputError.emit(hasWarning);
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  focusOut() {
    this.changeField.emit('default');
  }

  save() {
    this.checkWarnings();
    this.saveEmit.emit(true);
    this.calculate.emit(true);
  }
  canCompare() {
    if (this.extendedSurfaceCompareService.baselineSurface && this.extendedSurfaceCompareService.modifiedSurface && !this.inSetup) {
      return true;
    } else {
      return false;
    }
  }
  compareSurfaceArea(): boolean {
    if (this.canCompare()) {
      return this.extendedSurfaceCompareService.compareSurfaceArea(this.lossIndex);
    } else {
      return false;
    }
  }
  compareAmbientTemperature(): boolean {
    if (this.canCompare()) {
      return this.extendedSurfaceCompareService.compareAmbientTemperature(this.lossIndex);
    } else {
      return false;
    }
  }
  compareSurfaceTemperature(): boolean {
    if (this.canCompare()) {
      return this.extendedSurfaceCompareService.compareSurfaceTemperature(this.lossIndex);
    } else {
      return false;
    }
  }
  compareSurfaceEmissivity(): boolean {
    if (this.canCompare()) {
      return this.extendedSurfaceCompareService.compareSurfaceEmissivity(this.lossIndex);
    } else {
      return false;
    }
  }

}
