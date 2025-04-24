import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-aux-equipment-help',
    templateUrl: './aux-equipment-help.component.html',
    styleUrls: ['./aux-equipment-help.component.css'],
    standalone: false
})
export class AuxEquipmentHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
