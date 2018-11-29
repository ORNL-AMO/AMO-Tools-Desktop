import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FanRatedInfo } from '../../../../../shared/models/fans';
import { Settings } from '../../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../../shared/convert-units/convert-units.service';

@Component({
  selector: 'app-fan-basics',
  templateUrl: './fan-basics.component.html',
  styleUrls: ['./fan-basics.component.css']
})
export class FanBasicsComponent implements OnInit {
  @Input()
  fanRatedInfo: FanRatedInfo;
  @Input()
  basicsDone: number;
  @Output('emitSave')
  emitSave = new EventEmitter<FanRatedInfo>();
  @Input()
  settings: Settings;
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();

  planes: Array<number> = [
    1, 2, 3
  ]
  constructor(private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
  }

  focusField(str: string) {
    this.emitChangeField.emit(str);
  }

  save() {
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
