import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FanRatedInfo } from '../../../../shared/models/fans';
import { FormGroup } from '@angular/forms';
import { HelpPanelService } from '../../../../fsat/help-panel/help-panel.service';
import { Fsat203Service } from '../fsat-203.service';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';

@Component({
  selector: 'app-fsat-basics',
  templateUrl: './fsat-basics.component.html',
  styleUrls: ['./fsat-basics.component.css']
})
export class FsatBasicsComponent implements OnInit {
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
  ]

  constructor(private helpPanelService: HelpPanelService, private fsat203Service: Fsat203Service, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.ratedInfoForm = this.fsat203Service.getBasicsFormFromObject(this.fanRatedInfo, this.settings);
    
  }

  focusField(str: string) {
    this.emitChangeField.emit(str);
  }

  updatePressure() {
    this.fanRatedInfo = this.fsat203Service.getBasicsObjectFromForm(this.ratedInfoForm);
    this.updateBarometricPressure.emit(this.fanRatedInfo);
  }
  save() {
    this.fanRatedInfo = this.fsat203Service.getBasicsObjectFromForm(this.ratedInfoForm);
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
