import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { PhastService } from '../../phast.service';

@Component({
  selector: 'app-fixture-losses',
  templateUrl: './fixture-losses.component.html',
  styleUrls: ['./fixture-losses.component.css']
})
export class FixtureLossesComponent implements OnInit {

  fixtureLosses: Array<any>;

  constructor(private formBuilder: FormBuilder, private phastService: PhastService) { }

  ngOnInit() {
    if (!this.fixtureLosses) {
      this.fixtureLosses = new Array();
    }
  }

  addLoss() {
    let tmpForm = this.initForm();
    let tmpName = 'Loss #' + (this.fixtureLosses.length + 1);
    this.fixtureLosses.push({ 
      form: tmpForm, 
      name: tmpName,
      baselineHeatRequired: 0.0,
      modifiedHeatRequired: 0.0
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

  initForm() {
    return this.formBuilder.group({
      'baselineType': ['', Validators.required],
      'baselineFixtureWeight': ['', Validators.required],
      'baselineInitialTemp': ['', Validators.required],
      'baselineFinalTemp': ['', Validators.required],
      'baselineCorrectionFactor': ['', Validators.required],
      'modifiedType': ['', Validators.required],
      'modifiedFixtureWeight': ['', Validators.required],
      'modifiedInitialTemp': ['', Validators.required],
      'modifiedFinalTemp': ['', Validators.required],
      'modifiedCorrectionFactor': ['', Validators.required]
    })
  }

  calculateModified(loss: any){
    //TODO call phast service for fixture loss
    //loss.modifiedHeatRequired = this.phastService.fixtureLosses()

  }

  calculateBaseline(loss: any){
    //TODO call phast service for fixture loss
    //loss.baselineHeatRequired = this.phastService.fixtureLosses()
  }

}
