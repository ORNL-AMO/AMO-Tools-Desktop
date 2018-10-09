import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { GeneralSteamOperations } from '../../../shared/models/steam/ssmt';
import { Settings } from '../../../shared/models/settings';
import { CompareService } from '../../compare.service';
import { SsmtService } from '../../ssmt.service';

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
  constructor(private ssmtService: SsmtService, private compareService: CompareService) { }

  ngOnInit() {
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
