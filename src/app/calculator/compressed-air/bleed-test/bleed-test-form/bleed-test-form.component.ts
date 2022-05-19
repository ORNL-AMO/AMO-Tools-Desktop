import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
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
  @Output('calculate')
  calculate = new EventEmitter<BleedTestInput>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();

  bleedForm: FormGroup;
  bleedTestInputSub: Subscription;
  bleedTestOutput: number;
  bleedTestOutputSub: Subscription;
  
  constructor(private bleedTestService: BleedTestService) { }

  ngOnInit() {
    this.initSubscriptions();
  }

  initSubscriptions() {
    this.bleedTestInputSub = this.bleedTestService.bleedTestInput.subscribe(bleedTestInput => {
      this.bleedForm = this.bleedTestService.getBleedFormFromObj(bleedTestInput);
    });
    this.bleedTestOutputSub = this.bleedTestService.bleedTestOutput.subscribe(val => {
      this.bleedTestOutput = val;
    });
  }
  emitChange() {
    let inputs = this.bleedTestService.getBleedTestObjFromForm(this.bleedForm)
    this.bleedForm = this.bleedTestService.getBleedFormFromObj(inputs);
    this.bleedTestService.bleedTestInput.next(inputs);
    this.calculate.emit(inputs);
  }

  changeField(str: string) {
    this.emitChangeField.emit(str);
  }

  ngOnDestroy(){
    this.bleedTestInputSub.unsubscribe();
    this.bleedTestOutputSub.unsubscribe();
  }
}
