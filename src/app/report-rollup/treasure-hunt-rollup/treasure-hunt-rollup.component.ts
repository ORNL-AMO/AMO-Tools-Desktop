import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-treasure-hunt-rollup',
  templateUrl: './treasure-hunt-rollup.component.html',
  styleUrls: ['./treasure-hunt-rollup.component.css']
})
export class TreasureHuntRollupComponent implements OnInit {
  @Input()
  settings: Settings;

  constructor() { }

  ngOnInit(): void {
  }

}
