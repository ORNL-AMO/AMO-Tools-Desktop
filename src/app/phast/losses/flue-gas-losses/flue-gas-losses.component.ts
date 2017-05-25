import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import * as _ from 'lodash';
import { FlueGasLossesService } from './flue-gas-losses.service';
import { PhastService } from '../../phast.service';
import { FlueGas } from '../../../shared/models/losses/flueGas';
import { Losses } from '../../../shared/models/phast';

@Component({
  selector: 'app-flue-gas-losses',
  templateUrl: './flue-gas-losses.component.html',
  styleUrls: ['./flue-gas-losses.component.css']
})
export class FlueGasLossesComponent implements OnInit {
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


  _flueGasLosses: Array<any>;
    firstChange: boolean = true;

  constructor(private phastService: PhastService, private flueGasLossesService: FlueGasLossesService) { }

  ngOnInit() {
    if (!this._flueGasLosses) {
      this._flueGasLosses = new Array();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (changes.saveClicked) {
        this.saveLosses();
      }
      if (changes.addLossToggle) {
        this.addLoss();
      }
    }
    else {
      this.firstChange = false;
    }
  }

  addLoss() {
    this._flueGasLosses.push({
      form: this.flueGasLossesService.initForm(),
      name: 'Loss #' + (this._flueGasLosses.length + 1),
      heatLoss: 0.0
    });
  }

  removeLoss(str: string) {
    this._flueGasLosses = _.remove(this._flueGasLosses, loss => {
      return loss.name != str;
    });
    this.renameLoss();
  }

  renameLoss() {
    let index = 1;
    this._flueGasLosses.forEach(loss => {
      loss.name = 'Loss #' + index;
      index++;
    })
  }

  calculate(loss: any) {
    //TODO: ADD call to phastService to calculate heat loss
    //loss.heatLoss = this.phastService.flueGasLoss();
  }

  saveLosses(){
    
  }
}

