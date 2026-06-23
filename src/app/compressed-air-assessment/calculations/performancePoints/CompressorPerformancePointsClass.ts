import { PerformancePoint, PerformancePoints } from "../../../shared/models/compressed-air-assessment";

export class CompressorPerformancePointsClass implements PerformancePoints {

    fullLoad: PerformancePoint;
    maxFullFlow: PerformancePoint;
    midTurndown: PerformancePoint;
    turndown: PerformancePoint;
    unloadPoint: PerformancePoint;
    noLoad: PerformancePoint;
    blowoff: PerformancePoint;

    constructor(performancePoints: PerformancePoints) {
        this.fullLoad = this.copyPoint(performancePoints.fullLoad);
        this.maxFullFlow = this.copyPoint(performancePoints.maxFullFlow);
        this.midTurndown = this.copyPoint(performancePoints.midTurndown);
        this.turndown = this.copyPoint(performancePoints.turndown);
        this.unloadPoint = this.copyPoint(performancePoints.unloadPoint);
        this.noLoad = this.copyPoint(performancePoints.noLoad);
        this.blowoff = this.copyPoint(performancePoints.blowoff);
    }

    setDefaultsOn() {
        this.fullLoad = this.setPointDefaultsOn(this.fullLoad);
        this.maxFullFlow = this.setPointDefaultsOn(this.maxFullFlow);
        this.midTurndown = this.setPointDefaultsOn(this.midTurndown);
        this.turndown = this.setPointDefaultsOn(this.turndown);
        this.unloadPoint = this.setPointDefaultsOn(this.unloadPoint);
        this.noLoad = this.setPointDefaultsOn(this.noLoad);
        this.blowoff = this.setPointDefaultsOn(this.blowoff);
    }

    private copyPoint(point: PerformancePoint): PerformancePoint {
        return {
            dischargePressure: point?.dischargePressure,
            isDefaultPressure: point?.isDefaultPressure,
            airflow: point?.airflow,
            isDefaultAirFlow: point?.isDefaultAirFlow,
            power: point?.power,
            isDefaultPower: point?.isDefaultPower
        };
    }

    private setPointDefaultsOn(point: PerformancePoint): PerformancePoint {
        return {
            ...point,
            isDefaultPressure: true,
            isDefaultAirFlow: true,
            isDefaultPower: true
        };
    }
}
