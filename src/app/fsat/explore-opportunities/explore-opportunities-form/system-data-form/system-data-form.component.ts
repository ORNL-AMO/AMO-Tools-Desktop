import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FSAT } from '../../../../shared/models/fans';
import { FsatService } from '../../../fsat.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { HelpPanelService } from '../../../help-panel/help-panel.service';
import { ModifyConditionsService } from '../../../modify-conditions/modify-conditions.service';
import { FsatWarningService, FanFieldDataWarnings } from '../../../fsat-warning.service';
import { FanFieldDataService } from '../../../fan-field-data/fan-field-data.service';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'app-system-data-form',
    templateUrl: './system-data-form.component.html',
    styleUrls: ['./system-data-form.component.css']
})
export class SystemDataFormComponent implements OnInit {
    @Input()
    settings: Settings;
    @Input()
    exploreModIndex: number;
    @Input()
    fsat: FSAT;
    @Output('emitCalculate')
    emitCalculate = new EventEmitter<boolean>();

    showSystemData: boolean = false;
    showCost: boolean = false;
    showFlowRate: boolean = false;
    showOperatingHours: boolean = false;
    showPressure: boolean = false;
    showName: boolean = false;

    modificationWarnings: FanFieldDataWarnings;
    baselineWarnings: FanFieldDataWarnings;
    tmpBaselineName: string = 'Baseline';

    baselineForm: FormGroup;
    modificationForm: FormGroup;
    constructor(
        private convertUnitsService: ConvertUnitsService, 
        private helpPanelService: HelpPanelService, 
        private modifyConditionsService: ModifyConditionsService, 
        private fsatWarningService: FsatWarningService,
        private fanFieldDataService: FanFieldDataService) {
    }

    ngOnInit() {
        this.init();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.exploreModIndex) {
            if (!changes.exploreModIndex.isFirstChange()) {
                this.init()
            }
        }
    }

    init() {
        this.baselineForm = this.fanFieldDataService.getFormFromObj(this.fsat.fieldData);
        this.baselineForm.disable();
        this.modificationForm = this.fanFieldDataService.getFormFromObj(this.fsat.modifications[this.exploreModIndex].fsat.fieldData);
        this.initCost();
        this.initFlowRate();
        this.initPressure();
        this.initOpFraction();
        this.initSystemData();
        this.checkWarnings();
    }

    initCost() {
        if (this.baselineForm.controls.cost.value != this.modificationForm.controls.cost.value) {
            this.showCost = true;
        } else {
            this.showCost = false;
        }
    }

    initFlowRate() {
        if (this.baselineForm.controls.flowRate.value != this.modificationForm.controls.flowRate.value) {
            this.showFlowRate = true;
        } else {
            this.showFlowRate = false;
        }
    }

    initPressure() {
        if (this.baselineForm.controls.inletPressure.value != this.modificationForm.controls.inletPressure.value ||
            this.baselineForm.controls.outletPressure.value != this.modificationForm.controls.outletPressure.value) {
            this.showPressure = true;
        } else {
            this.showPressure = false;
        }
    }

    initOpFraction() {
        if (this.baselineForm.controls.operatingFraction.value != this.modificationForm.controls.operatingFraction.value) {
            this.showOperatingHours = true;
        } else {
            this.showOperatingHours = false;
        }
    }

    initSystemData() {
        if (this.showCost || this.showFlowRate || this.showPressure || this.showOperatingHours) {
            this.showSystemData = true;
        } else {
            this.showSystemData = false;
        }
    }

    toggleSystemData() {
        if (this.showSystemData == false) {
            this.showCost = false;
            this.showFlowRate = false;
            this.showPressure = false;
            this.showOperatingHours = false;
            this.toggleCost();
            this.toggleFlowRate();
            this.togglePressure();
            this.toggleOperatingHours();
        }
    }

    toggleCost() {
        if (this.showCost == false) {
            this.modificationForm.controls.cost.patchValue(this.baselineForm.controls.cost);
            this.calculate();
        }
    }

    togglePressure() {
        if (this.showPressure == false) {
            this.modificationForm.controls.inletPressure.patchValue(this.baselineForm.controls.inletPressure.value);
            this.modificationForm.controls.outletPressure.patchValue(this.baselineForm.controls.outletPressure.value);
            this.calculate();
        }
    }

    toggleOperatingHours() {
        if (this.showOperatingHours == false) {
            this.modificationForm.controls.operatingFraction.patchValue(this.baselineForm.controls.operatingFraction.value);
            this.calculate();
        }
    }

    toggleFlowRate() {
        if (this.showFlowRate == false) {
            this.modificationForm.controls.flowRate.patchValue(this.baselineForm.controls.flowRate.value);
            this.calculate();
        }
    }

    calculate() {
        this.fsat.modifications[this.exploreModIndex].fsat.fieldData = this.fanFieldDataService.getObjFromForm(this.modificationForm);
        this.checkWarnings();
        this.emitCalculate.emit(true);
    }

    focusField(str: string) {
        this.helpPanelService.currentField.next(str);
        this.modifyConditionsService.modifyConditionsTab.next('fan-field-data');
    }

    checkWarnings() {
        this.baselineWarnings = this.fsatWarningService.checkFieldDataWarnings(this.fsat, this.settings);
        this.modificationWarnings = this.fsatWarningService.checkFieldDataWarnings(this.fsat.modifications[this.exploreModIndex].fsat, this.settings);
    }

    getDisplayUnit(unit: string) {
        let tmpUnit = this.convertUnitsService.getUnit(unit);
        let dsp = tmpUnit.unit.name.display.replace('(', '');
        dsp = dsp.replace(')', '');
        return dsp;
    }
}
