import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-header-help',
  templateUrl: './header-help.component.html',
  styleUrls: ['./header-help.component.css']
})
export class HeaderHelpComponent implements OnInit {
  @Input()
  currentField: string;
  @Input()
  thermodynamicQuantity: number;
  @Input()
  settings: Settings;

  constructor() { }

  ngOnInit() {
  }

}
