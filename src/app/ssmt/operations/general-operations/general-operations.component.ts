import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { GeneralSteamOperations } from '../../../shared/models/steam/ssmt';
import { Settings } from '../../../shared/models/settings';
import { CompareService } from '../../compare.service';
import { SsmtService } from '../../ssmt.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';

@Component({
  selector: 'app-general-operations',
  templateUrl: './general-operations.component.html',
  styleUrls: ['./general-operations.component.css']
})
export class GeneralOperationsComponent implements OnInit {
  @Input()
  generalSteamOperations: GeneralSteamOperations;
  @Input()
  settings: Settings;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();
  @Input()
  selected: boolean;
  @Input()
  inSetup: boolean;
  @Input()
  idString: string;
  
  constructor(private ssmtService: SsmtService, private compareService: CompareService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    if(!this.generalSteamOperations.makeUpWaterTemperature){
      let defaultVal: number = this.convertUnitsService.value(70).from('F').to(this.settings.steamTemperatureMeasurement);
      defaultVal = this.convertUnitsService.roundVal(defaultVal, 1);
      this.generalSteamOperations.makeUpWaterTemperature = this.convertUnitsService.value(70).from('F').to(this.settings.steamTemperatureMeasurement);
    }
    if(!this.generalSteamOperations.sitePowerImport){
      this.generalSteamOperations.sitePowerImport = 0;
    }
  }

  save(){
    this.emitSave.emit(true);
  }

  canCompare() {
    if (this.compareService.baselineSSMT && this.compareService.modifiedSSMT && !this.inSetup) {
      return true;
    } else {
      return false;
    }
  }

  isSitePowerImportDifferent() {
    if (this.canCompare()) {
      return this.compareService.isSitePowerImportDifferent();
    } else {
      return false;
    }
  }
  isMakeUpWaterTemperatureDifferent() {
    if (this.canCompare()) {
      return this.compareService.isMakeUpWaterTemperatureDifferent();
    } else {
      return false;
    }
  }

  focusField(str: string){
    this.ssmtService.currentField.next(str);
  }  
  focusOut() {
    this.ssmtService.currentField.next('default');
  }
}
