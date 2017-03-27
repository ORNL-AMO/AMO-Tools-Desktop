import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
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
    if (!this.openingLosses) {
      this.openingLosses = new Array();
    }
  }

  addLoss() {
    let tmpName = 'Opening Loss #' + (this.openingLosses.length + 1);
    this.openingLosses.push({
      form: this.openingLossesService.initForm(),
      name: tmpName,
      totalOpeningLosses: 0.0
    });
  }

  removeLoss(str: string) {
    this.openingLosses = _.remove(this.openingLosses, loss => {
      return loss.name != str;
    });
    this.renameLosses();
  }

  renameLosses() {
    let index = 1;
    this.openingLosses.forEach(loss => {
      loss.name = 'Opening #' + index;
      index++;
    })
  }


  hideCalc(loss: any) {
    loss.showFixed = false;
    loss.showVariable = false;
  }


  calculate(loss: any) {
    debugger
    if (loss.form.value.openingType == 'Rectangular (Square)') {
      let round = Math.min(loss.form.value.lengthOfOpening, loss.form.value.heightOfOpening) / loss.form.value.wallThickness;
      console.log(round);
    } else if (loss.form.value.openingType == 'Round') {
      let round = loss.form.value.lengthOfOpening / loss.form.value.wallThickness;
      console.log(round);
    }
    //  this.phastService.openingLosses()
  }
}
