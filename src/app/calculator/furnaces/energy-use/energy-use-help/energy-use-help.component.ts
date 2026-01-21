import { Component, OnInit, Input } from '@angular/core';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-energy-use-help',
  templateUrl: './energy-use-help.component.html',
  styleUrls: ['./energy-use-help.component.css'],
  standalone: false
})
export class EnergyUseHelpComponent implements OnInit {
  @Input()
  currentField: string;

  docsLink: string = environment.measurDocsUrl;
  constructor() { }

  ngOnInit() {
  }

}
