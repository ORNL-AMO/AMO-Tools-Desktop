import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-custom-materials',
  templateUrl: './custom-materials.component.html',
  styleUrls: ['./custom-materials.component.css']
})
export class CustomMaterialsComponent implements OnInit {
  @Input()
  settings: Settings;

  constructor() { }

  ngOnInit() {
  }

}
