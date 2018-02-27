import { Component, OnInit } from '@angular/core';
import { FanRatedInfo, Fan203Inputs, BaseGasDensity } from '../../../shared/models/fans';
import { FsatService } from '../../../fsat/fsat.service';
import { Fsat203Service } from './fsat-203.service';

@Component({
  selector: 'app-fsat-203',
  templateUrl: './fsat-203.component.html',
  styleUrls: ['./fsat-203.component.css']
})
export class Fsat203Component implements OnInit {
  tabSelect: string = 'results';
  inputs: Fan203Inputs;
  showBasics: boolean = true;
  basicsDone: boolean = false;
  densityDone: boolean = false;
  canContinue: boolean = false;
  formSelect: string = 'none';
  constructor(private fsatService: FsatService, private fsat203Service: Fsat203Service) { }

  ngOnInit() {
    // this.fsatService.test();
    this.inputs = this.fsat203Service.getMockData();
    let test = this.fsatService.fan203(this.inputs);
    console.log(test);
  }


  setTab(str: string) {
    this.tabSelect = str;
  }

  continue() {
    this.showBasics = false;
  }

  editBasics() {
    this.showBasics = true;
  }

  saveBasics(info: FanRatedInfo) {
    this.inputs.FanRatedInfo = info;
  }

  saveDensity(density: BaseGasDensity) {
    this.inputs.BaseGasDensity = density;
  }

  setDensityContinue(bool: boolean) {
    this.densityDone = bool;
  }

  setBasicsContinue(bool: boolean) {
    this.basicsDone = bool;
  }

  checkContinue() {
    this.canContinue = (this.basicsDone && this.densityDone);
  }

  goToForm(str: string){
    this.formSelect = str;
  }
}
