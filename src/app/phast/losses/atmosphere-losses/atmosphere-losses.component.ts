import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { FormBuilder } from '@angular/forms';
import { AtmosphereLossesService } from './atmosphere-losses.service';

@Component({
  selector: 'app-atmosphere-losses',
  templateUrl: './atmosphere-losses.component.html',
  styleUrls: ['./atmosphere-losses.component.css']
})
export class AtmosphereLossesComponent implements OnInit {
  atmosphereLosses: Array<any>;

  constructor(private formBuilder: FormBuilder, private atmosphereLossesService: AtmosphereLossesService) { }

  ngOnInit() {
    if(!this.atmosphereLosses){
      this.atmosphereLosses = new Array();
    }
  }

  addLoss() {
    let tmpForm = this.atmosphereLossesService.initForm();
    let tmpName = 'Loss #' + (this.atmosphereLosses.length + 1);
    this.atmosphereLosses.push({ 
      form: tmpForm, 
      name: tmpName 
    });
  }

  removeLoss(str: string) {
    this.atmosphereLosses = _.remove(this.atmosphereLosses, loss => {
      return loss.name != str;
    });
    this.renameLoss();
  }

  renameLoss() {
    let index = 1;
    this.atmosphereLosses.forEach(loss => {
      loss.name = 'Loss #' + index;
      index++;
    })
  }
}
