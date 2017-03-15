import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-flue-gas-losses',
  templateUrl: './flue-gas-losses.component.html',
  styleUrls: ['./flue-gas-losses.component.css']
})
export class FlueGasLossesComponent implements OnInit {
  flueGasLosses: Array<any>;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    if(!this.flueGasLosses){
      this.flueGasLosses = new Array();
    }
  }

  addLoss() {
    let tmpForm = this.initForm();
    let tmpName = 'Loss #' + (this.flueGasLosses.length + 1);
    this.flueGasLosses.push({ form: tmpForm, name: tmpName });
  }

  removeLoss(str: string) {
    this.flueGasLosses = _.remove(this.flueGasLosses, loss => {
      return loss.name != str;
    });
    this.renameLoss();
  }

  renameLoss() {
    let index = 1;
    this.flueGasLosses.forEach(loss => {
      loss.name = 'Loss #' + index;
      index++;
    })
  }

  initForm(){
    return this.formBuilder.group({
    })
  }
}

