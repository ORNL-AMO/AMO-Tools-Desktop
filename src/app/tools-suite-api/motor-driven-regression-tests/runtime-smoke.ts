import '@angular/compiler';
import type { ElectronService } from '../../electron/electron.service';
import { ToolsSuiteApiService } from '../tools-suite-api.service';
import { SuiteApiHelperService } from '../suite-api-helper.service';
import { PumpsSuiteApiService } from '../pumps-suite-api.service';
import suitePackage from 'measur-tools-suite/package.json';

async function run() {
  const tools = new ToolsSuiteApiService(null, null, null, null, null, null, null, null, { isElectron: false } as ElectronService);
  await tools.initializeModule();
  const pumps = new PumpsSuiteApiService(new SuiteApiHelperService(tools), tools);
  const result = pumps.resultsExisting({pump_style:6,pump_specified:80,pump_rated_speed:1780,
    drive:0,specifiedDriveEfficiency:100,differentialPressure:0,kinematic_viscosity:1,
    specific_gravity:1,stages:2,fixed_speed:1,line_frequency:60,motor_rated_power:200,
    motor_rated_speed:1780,efficiency_class:3,efficiency:95,motor_rated_voltage:460,
    load_estimation_method:0,motor_rated_fla:225,margin:0,operating_hours:8760,flow_rate:1840,
    head:174.85,motor_field_power:80,motor_field_current:125.857,motor_field_voltage:480,
    cost_kw_hour:0.05,fluidType:'Water',fluidTemperature:68});
  const performance = pumps.motorPerformance(60,3,200,1780,90,460,225,1);
  const powerFactor = pumps.motorPowerFactor(200,0,60,90,460,60,1780,1,90);
  const near = (actual: number, expected: number) => { if (!Number.isFinite(actual) || !Number.isFinite(expected) || Math.abs(actual-expected)>1e-8) throw new Error(`${actual} != ${expected}`); };
  if(suitePackage.version!=='1.2.7-beta.446.1') throw new Error('Wrong Suite version');
  near(result.motor_power,80);near(result.annual_energy,700.8);near(result.annual_cost,35040);
  near(performance.efficiency,89.1);near(powerFactor,4.669958457276021);
  const summary={passed:true,version:suitePackage.version,protocol:location.protocol,motorPowerKw:result.motor_power,annualEnergyMWh:result.annual_energy,
    annualCostDollars:result.annual_cost,specifiedMotorEfficiencyPercent:performance.efficiency,
    nearZeroPowerFactorPercent:powerFactor};
  document.getElementById('result')!.textContent=JSON.stringify(summary);
}
run().catch(error=>{const result={passed:false,error:String(error)};
  document.getElementById('result')!.textContent=JSON.stringify(result);
});
