import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';
import { FixtureLossesService } from './fixture-losses.service';

@Component({
  selector: 'app-fixture-losses',
  templateUrl: './fixture-losses.component.html',
  styleUrls: ['./fixture-losses.component.css']
})
export class FixtureLossesComponent implements OnInit {

  fixtureLosses: Array<any>;

  constructor(private formBuilder: FormBuilder, private phastService: PhastService, private fixtureLossesService: FixtureLossesService) { }

  ngOnInit() {
    if (!this.fixtureLosses) {
      this.fixtureLosses = new Array();
    }
  }

  addLoss() {
    let tmpForm = this.fixtureLossesService.initForm();
    let tmpName = 'Loss #' + (this.fixtureLosses.length + 1);
    this.fixtureLosses.push({ 
      form: tmpForm, 
      name: tmpName,
      heatRequired: 0.0
    });
  }

  removeLoss(str: string) {
    this.fixtureLosses = _.remove(this.fixtureLosses, fixture => {
      return fixture.name != str;
    });
    this.renameLosses();
  }

  renameLosses() {
    let index = 1;
    this.fixtureLosses.forEach(fixture => {
      fixture.name = 'Fixture #' + index;
      index++;
    })
  }

  calculate(loss: any){
    //TODO call phast service for fixture loss
    //loss.heatRequired = this.phastService.fixtureLosses()

  }

}
