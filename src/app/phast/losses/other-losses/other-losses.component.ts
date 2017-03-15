import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { FormBuilder } from '@angular/forms';
@Component({
  selector: 'app-other-losses',
  templateUrl: './other-losses.component.html',
  styleUrls: ['./other-losses.component.css']
})
export class OtherLossesComponent implements OnInit {
  otherLosses: Array<any>;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    if(!this.otherLosses){
      this.otherLosses = new Array();
    }
  }

  addLoss() {
    let tmpForm = this.initForm();
    let tmpName = 'Loss #' + (this.otherLosses.length + 1);
    this.otherLosses.push({ form: tmpForm, name: tmpName });
  }

  removeLoss(str: string) {
    this.otherLosses = _.remove(this.otherLosses, loss => {
      return loss.name != str;
    });
    this.renameLoss();
  }

  renameLoss() {
    let index = 1;
    this.otherLosses.forEach(loss => {
      loss.name = 'Loss #' + index;
      index++;
    })
  }

  initForm(){
    return this.formBuilder.group({
    })
  }
}
