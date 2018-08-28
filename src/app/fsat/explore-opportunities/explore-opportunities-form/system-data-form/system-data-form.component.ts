import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FSAT } from '../../../../shared/models/fans';
import { FsatService } from '../../../fsat.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { HelpPanelService } from '../../../help-panel/help-panel.service';
import { ModifyConditionsService } from '../../../modify-conditions/modify-conditions.service';
import { FsatWarningService, FanFieldDataWarnings } from '../../../fsat-warning.service';

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
    showOperatingFraction: boolean = false;
    showPressure: boolean = false;
    showName: boolean = false;

    modificationWarnings: FanFieldDataWarnings;
    baselineWarnings: FanFieldDataWarnings;
    tmpBaselineName: string = 'Baseline';
    constructor(private convertUnitsService: ConvertUnitsService, private helpPanelService: HelpPanelService, private modifyConditionsService: ModifyConditionsService, private fsatWarningService: FsatWarningService) {
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
        this.initCost();
        this.initFlowRate();
        this.initPressure();
        this.initOpFraction();
        this.initSystemData();
        this.checkWarnings();
    }

    initCost() {
        if (this.fsat.fieldData.cost != this.fsat.modifications[this.exploreModIndex].fsat.fieldData.cost) {
            this.showCost = true;
        } else {
            this.showCost = false;
        }
    }

    initFlowRate() {
        if (this.fsat.fieldData.flowRate != this.fsat.modifications[this.exploreModIndex].fsat.fieldData.flowRate) {
            this.showFlowRate = true;
        } else {
            this.showFlowRate = false;
        }
    }

    initPressure() {
        if (this.fsat.fieldData.inletPressure != this.fsat.modifications[this.exploreModIndex].fsat.fieldData.inletPressure ||
            this.fsat.fieldData.outletPressure != this.fsat.modifications[this.exploreModIndex].fsat.fieldData.outletPressure) {
            this.showPressure = true;
        } else {
            this.showPressure = false;
        }
    }

    initOpFraction() {
        if (this.fsat.fieldData.operatingFraction != this.fsat.modifications[this.exploreModIndex].fsat.fieldData.operatingFraction) {
            this.showOperatingFraction = true;
        } else {
            this.showOperatingFraction = false;
        }
    }

    initSystemData() {
        if (this.showCost || this.showFlowRate || this.showPressure || this.showOperatingFraction) {
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
            this.showOperatingFraction = false;
            this.toggleCost();
            this.toggleFlowRate();
            this.togglePressure();
            this.toggleOperatingFraction();
        }
    }

    toggleCost() {
        if (this.showCost == false) {
            this.fsat.modifications[this.exploreModIndex].fsat.fieldData.cost = this.fsat.fieldData.cost;
            this.calculate();
        }
    }

    togglePressure() {
        if (this.showPressure == false) {
            this.fsat.modifications[this.exploreModIndex].fsat.fieldData.inletPressure = this.fsat.fieldData.inletPressure;
            this.fsat.modifications[this.exploreModIndex].fsat.fieldData.outletPressure = this.fsat.fieldData.outletPressure;
            this.calculate();
        }
    }

    toggleOperatingFraction() {
        if (this.showOperatingFraction == false) {
            this.fsat.modifications[this.exploreModIndex].fsat.fieldData.operatingFraction = this.fsat.fieldData.operatingFraction;
            this.calculate();
        }
    }

    toggleFlowRate() {
        if (this.showFlowRate == false) {
            this.fsat.modifications[this.exploreModIndex].fsat.fieldData.flowRate = this.fsat.fieldData.flowRate;
            this.calculate();
        }
    }

    calculate() {
        this.emitCalculate.emit(true);
        this.checkWarnings();
    }

    focusField(str: string) {
        this.helpPanelService.currentField.next(str);
        this.modifyConditionsService.modifyConditionsTab.next('fan-field-data')
    }

    checkWarnings() {
        this.baselineWarnings = this.fsatWarningService.checkFieldDataWarnings(this.fsat, this.settings);
        this.modificationWarnings = this.fsatWarningService.checkFieldDataWarnings(this.fsat.modifications[this.exploreModIndex].fsat, this.settings);
    }

    getUnit(unit: string) {
        let tmpUnit = this.convertUnitsService.getUnit(unit);
        let dsp = tmpUnit.unit.name.display.replace('(', '');
        dsp = dsp.replace(')', '');
        return dsp;
    }
}
