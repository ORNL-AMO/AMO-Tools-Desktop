import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-ssmt-rollup-print',
  templateUrl: './ssmt-rollup-print.component.html',
  styleUrls: ['./ssmt-rollup-print.component.css']
})
export class SsmtRollupPrintComponent implements OnInit {
  @Input()
  settings: Settings;
  
  constructor() { }

  ngOnInit(): void {
  }

}
