import { Component, OnInit, Input, SimpleChanges, SimpleChange, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { Losses } from '../../../shared/models/phast';
import { EnergyInputService } from './energy-input.service';
import { EnergyInput } from '../../../shared/models/losses/energyInput';

@Component({
  selector: 'app-energy-input',
  templateUrl: './energy-input.component.html',
  styleUrls: ['./energy-input.component.css']
})
export class EnergyInputComponent implements OnInit {
  @Input()
  losses: Losses;
  @Input()
  saveClicked: boolean;
  @Input()
  lossState: any;
  @Input()
  addLossToggle: boolean;
  @Output('savedLoss')
  savedLoss = new EventEmitter<boolean>();
  @Input()
  baselineSelected: boolean;
  @Output('fieldChange')
  fieldChange = new EventEmitter<string>();

  _energyInputs: Array<any>;
  firstChange: boolean = true;
  constructor(private energyInputService: EnergyInputService, private phastService: PhastService) { }

  ngOnInit(){
    
  }

  // ngOnChanges(changes: SimpleChanges) {
  //   if (!this.firstChange) {
  //     if (changes.saveClicked) {
  //       this.saveLosses();
  //     }
  //     if (changes.addLossToggle) {
  //       this.addLoss();
  //     }
  //   }
  //   else {
  //     this.firstChange = false;
  //   }
  // }

  // ngOnInit() {
  //   if (!this._energyInputs) {
  //     this._energyInputs = new Array();
  //   }
  //   if (this.losses.energyInput) {
  //     this.losses.energyInput.forEach(loss => {
  //       let tmpLoss = {
  //         form: this.energyInputService.getLossFromForm(loss),
  //         name: 'Input #' + (this._energyInputs.length + 1)
  //       };
  //       this.calculate(tmpLoss);
  //       this._energyInputs.unshift(tmpLoss);
  //     })
  //   }
  // }
  // addLoss() {
  //   this._wallLosses.unshift({
  //     form: this.wallLossesService.initForm(),
  //     name: 'Loss #' + (this._wallLosses.length + 1),
  //     heatLoss: 0.0
  //   });
  //   this.lossState.saved = false;
  // }

  // removeLoss(str: string) {
  //   this._wallLosses = _.remove(this._wallLosses, loss => {
  //     return loss.name != str;
  //   });
  //   this.lossState.saved = false;
  //   this.renameLossess();
  // }

  // renameLossess() {
  //   let index = 1;
  //   this._wallLosses.forEach(loss => {
  //     loss.name = 'Loss #' + index;
  //     index++;
  //   })
  // }

}
