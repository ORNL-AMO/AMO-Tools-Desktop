import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../../../../shared/models/settings';

@Component({
  selector: 'app-bag-method-form',
  templateUrl: './bag-method-form.component.html',
  styleUrls: ['./bag-method-form.component.css']
})
export class BagMethodFormComponent implements OnInit {

  estimateMethodForm: FormGroup;
  @Input()
  settings: Settings;
  
  constructor() { }

  ngOnInit(): void {
    
  }

}
