import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-fsat-rollup-print',
  templateUrl: './fsat-rollup-print.component.html',
  styleUrls: ['./fsat-rollup-print.component.css']
})
export class FsatRollupPrintComponent implements OnInit {
  @Input()
  settings: Settings;

  constructor() { }

  ngOnInit() {
  }

}
