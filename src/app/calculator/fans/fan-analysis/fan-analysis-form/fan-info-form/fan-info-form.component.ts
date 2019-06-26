import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FanRatedInfo } from '../../../../../shared/models/fans';
import { Settings } from '../../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { HelpPanelService } from '../../../../../fsat/help-panel/help-panel.service';
import { ConvertUnitsService } from '../../../../../shared/convert-units/convert-units.service';
import { FanInfoFormService } from './fan-info-form.service';

@Component({
  selector: 'app-fan-info-form',
  templateUrl: './fan-info-form.component.html',
  styleUrls: ['./fan-info-form.component.css']
})
export class FanInfoFormComponent implements OnInit {
  // @Input()
  // toggleResetData: boolean;
  @Input()
  fanRatedInfo: FanRatedInfo;
  @Input()
  basicsDone: boolean;
  @Output('emitSave')
  emitSave = new EventEmitter<FanRatedInfo>();
  @Output('updateBarometricPressure')
  updateBarometricPressure = new EventEmitter<FanRatedInfo>();
  @Input()
  settings: Settings;
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();

  ratedInfoForm: FormGroup;

  planes: Array<number> = [
    1, 2, 3
  ];

  constructor(private helpPanelService: HelpPanelService, private fanInfoFormService: FanInfoFormService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.ratedInfoForm = this.fanInfoFormService.getBasicsFormFromObject(this.fanRatedInfo, this.settings);
  }

  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes.toggleResetData && !changes.toggleResetData.firstChange) {
  //     this.resetData();
  //   }
  // }

  resetData() {
    this.ratedInfoForm = this.fanInfoFormService.getBasicsFormFromObject(this.fanRatedInfo, this.settings);
    this.save();
  }

  focusField(str: string) {
    this.emitChangeField.emit(str);
  }

  updatePressure() {
    this.fanRatedInfo = this.fanInfoFormService.getBasicsObjectFromForm(this.ratedInfoForm);
    this.updateBarometricPressure.emit(this.fanRatedInfo);
  }
  save() {
    this.fanRatedInfo = this.fanInfoFormService.getBasicsObjectFromForm(this.ratedInfoForm);
    this.emitSave.emit(this.fanRatedInfo);
  }

  getDisplayUnit(unit: any) {
    if (unit) {
      let dispUnit: string = this.convertUnitsService.getUnit(unit).unit.name.display;
      dispUnit = dispUnit.replace('(', '');
      dispUnit = dispUnit.replace(')', '');
      return dispUnit;
    }
  }
}
