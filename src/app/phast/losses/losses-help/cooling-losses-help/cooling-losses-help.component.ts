import { Component, OnInit, Input } from '@angular/core';
@Component({
  selector: 'app-cooling-losses-help',
  templateUrl: './cooling-losses-help.component.html',
  styleUrls: ['./cooling-losses-help.component.css']
})
export class CoolingLossesHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
