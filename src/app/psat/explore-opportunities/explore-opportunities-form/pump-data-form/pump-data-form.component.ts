import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PSAT } from '../../../../shared/models/psat';
import { PsatService } from '../../../psat.service';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
@Component({
  selector: 'app-pump-data-form',
  templateUrl: './pump-data-form.component.html',
  styleUrls: ['./pump-data-form.component.css']
})
export class PumpDataFormComponent implements OnInit {

    constructor(){

    }

    ngOnInit(){

    }
}