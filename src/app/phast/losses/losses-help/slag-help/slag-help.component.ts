import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-slag-help',
  templateUrl: './slag-help.component.html',
  styleUrls: ['./slag-help.component.css']
})
export class SlagHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
