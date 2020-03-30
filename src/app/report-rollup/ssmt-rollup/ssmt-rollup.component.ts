import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-ssmt-rollup',
  templateUrl: './ssmt-rollup.component.html',
  styleUrls: ['./ssmt-rollup.component.css']
})
export class SsmtRollupComponent implements OnInit {
  @Input()
  settings: Settings;

  dataOption: string = 'cost';
  constructor() { }

  ngOnInit() {
  }

  setDataOption(str: string){
    this.dataOption = str;
  }

}
