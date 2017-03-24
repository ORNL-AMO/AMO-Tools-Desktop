import { Component, OnInit, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { ModalDirective } from 'ng2-bootstrap';
import { PhastService } from '../../phast.service';
import { OpeningLossesService } from './opening-losses.service';
@Component({
  selector: 'app-opening-losses',
  templateUrl: './opening-losses.component.html',
  styleUrls: ['./opening-losses.component.css']
})
export class OpeningLossesComponent implements OnInit {

  openingLosses: Array<any>;
  editLoss: any;
  constructor(private phastService: PhastService, private openingLossesService: OpeningLossesService) { }

  ngOnInit() {
    if(!this.openingLosses){
      this.openingLosses = new Array();
    }
  }

  addLoss() {
    let tmpName = 'Opening Loss #' + (this.openingLosses.length + 1);
    this.openingLosses.push({ 
      fixedForm: this.openingLossesService.initForm(), 
      variableForm: this.openingLossesService.initForm(), 
      name: tmpName, 
      showfixed: false, 
      showVariable: false 
    });
  }

  removeLoss(str: string) {
    this.openingLosses = _.remove(this.openingLosses, fixture => {
      return fixture.name != str;
    });
    this.renameLosses();
  }

  renameLosses() {
    let index = 1;
    this.openingLosses.forEach(fixture => {
      fixture.name = 'Openeing #' + index;
      index++;
    })
  }


  //  Fixed Opening MODAL
  @ViewChild('fixedModal') public fixedModal: ModalDirective;
  showFixedModal(loss: any){
    this.editLoss = loss;
    this.fixedModal.show();
  }

  hideFixedModal(){
    this.fixedModal.hide();
  }


  //  Variable Opening MODAL
  @ViewChild('variableModal') public variableModal: ModalDirective;
  showVariableModal(loss: any){
    this.editLoss = loss;
    this.variableModal.show();
  }

  hideVariableModal(){
    this.variableModal.hide();
  }

  showFixed(loss: any){
    loss.showFixed = true;
  }

  showVariable(loss: any){
    loss.showVariable = true;
  }

  hideCalc(loss: any){
    loss.showFixed = false;
    loss.showVariable = false;
  }

}
