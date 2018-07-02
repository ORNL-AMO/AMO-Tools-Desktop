import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-fsat-rollup-graphs',
  templateUrl: './fsat-rollup-graphs.component.html',
  styleUrls: ['./fsat-rollup-graphs.component.css']
})
export class FsatRollupGraphsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  printView: boolean;

  constructor() { }

  ngOnInit() {
  }

}
