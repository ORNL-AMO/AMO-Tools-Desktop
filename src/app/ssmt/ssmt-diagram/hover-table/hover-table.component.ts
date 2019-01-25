import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-hover-table',
  templateUrl: './hover-table.component.html',
  styleUrls: ['./hover-table.component.css']
})
export class HoverTableComponent implements OnInit {
  @Input()
  hoveredEquipment: string;
  @Input()
  settings: Settings;
  constructor() { }

  ngOnInit() {
  }

}
