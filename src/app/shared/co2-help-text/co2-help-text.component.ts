import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-co2-help-text',
    templateUrl: './co2-help-text.component.html',
    styleUrls: ['./co2-help-text.component.css'],
    standalone: false
})
export class Co2HelpTextComponent implements OnInit {

  @Input() currentField: string;

  constructor() { }

  ngOnInit(): void {
  }

}
