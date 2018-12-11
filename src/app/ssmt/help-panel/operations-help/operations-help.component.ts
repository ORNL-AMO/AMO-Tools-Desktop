import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-operations-help',
  templateUrl: './operations-help.component.html',
  styleUrls: ['./operations-help.component.css']
})
export class OperationsHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
