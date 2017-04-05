import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-charge-material-help',
  templateUrl: './charge-material-help.component.html',
  styleUrls: ['./charge-material-help.component.css']
})
export class ChargeMaterialHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
