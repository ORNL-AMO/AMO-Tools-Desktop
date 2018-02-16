import { Component, OnInit } from '@angular/core';
import {StandaloneService} from "../../standalone.service";
import {PneumaticValve} from "../../../shared/models/standalone";

@Component({
  selector: 'app-flow-factor',
  templateUrl: './flow-factor.component.html',
  styleUrls: ['./flow-factor.component.css']
})
export class FlowFactorComponent implements OnInit  {


  constructor() { }

  ngOnInit() {
  }

}
