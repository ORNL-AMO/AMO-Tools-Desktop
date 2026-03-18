import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FlueGasMaterial } from '../../shared/models/materials';
import { Settings } from '../../shared/models/settings';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { PhastService } from '../../phast/phast.service';
import * as _ from 'lodash';
import { FlueGasMaterialDbService } from '../../indexedDb/flue-gas-material-db.service';

@Component({
  selector: 'app-lighting-fixtures-material',
  templateUrl: './lighting-fixtures-material.component.html',
  styleUrls: ['./lighting-fixtures-material.component.css'],
  standalone: false
})
export class LightingFixturesMaterialComponent implements OnInit {
    @Output('closeModal')
    closeModal = new EventEmitter<number>();
    @Input()
    settings: Settings;
    @Input()
    editExistingMaterial: boolean;
    @Input()
    deletingMaterial: boolean;
    @Output('hideModal')
    hideModal = new EventEmitter();

     ngOnInit() {

     }
}