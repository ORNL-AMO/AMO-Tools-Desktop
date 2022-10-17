import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { BleedTestInput } from '../../../../shared/models/standalone';
import { BleedTestService } from '../bleed-test.service';

@Component({
  selector: 'app-bleed-test-form',
  templateUrl: './bleed-test-form.component.html',
  styleUrls: ['./bleed-test-form.component.css']
})
export class BleedTestFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();

  bleedForm: UntypedFormGroup;
  bleedTestOutput: number;
  bleedTestOutputSub: Subscription;
  resetDataSub: Subscription;
  generateExampleSub: Subscription;

  constructor(private bleedTestService: BleedTestService) { }

  ngOnInit() {
    this.initSubscriptions();
  }

  initSubscriptions() {
    this.resetDataSub = this.bleedTestService.resetData.subscribe(value => {
      this.updateForm();
    });
    this.generateExampleSub = this.bleedTestService.generateExample.subscribe(value => {
      this.updateForm();
    });
    this.bleedTestOutputSub = this.bleedTestService.bleedTestOutput.subscribe( val => {
      this.bleedTestOutput = val;
    })
  }

  updateForm() {
    let inputs: BleedTestInput = this.bleedTestService.bleedTestInput.getValue();
    this.bleedForm = this.bleedTestService.getBleedFormFromObj(inputs);
    this.save();
  }

  save() {
    let inputs: BleedTestInput = this.bleedTestService.getBleedTestObjFromForm(this.bleedForm);
    this.bleedTestService.bleedTestInput.next(inputs);
  }

  changeField(str: string) {
    this.emitChangeField.emit(str);
  }

  ngOnDestroy() {
    this.generateExampleSub.unsubscribe();
    this.resetDataSub.unsubscribe();
    this.bleedTestOutputSub.unsubscribe();
  }

}
