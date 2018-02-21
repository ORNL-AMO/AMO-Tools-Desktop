import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HelpPanelService } from '../help-panel/help-panel.service';
@Component({
  selector: 'app-fan-curve-data',
  templateUrl: './fan-curve-data.component.html',
  styleUrls: ['./fan-curve-data.component.css']
})
export class FanCurveDataComponent implements OnInit {

  dataForm: FormGroup;
  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.dataForm = this.formBuilder.group({});
  }

}
