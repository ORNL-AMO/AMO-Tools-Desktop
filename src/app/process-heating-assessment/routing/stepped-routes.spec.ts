import { Route } from '@angular/router';
import { ROUTE_TOKENS } from '../constants/process-heating-routes';
import { ROUTES } from '../process-heating-assessment.module';
import { deriveSteppedRoutes } from './stepped-routes';

describe('deriveSteppedRoutes', () => {
  it('matches the hand-written step order this replaced, including path and view per step', () => {
    const HEAT_BALANCE_BASE = `${ROUTE_TOKENS.baseline}/${ROUTE_TOKENS.heatBalance}`;

    expect(deriveSteppedRoutes(ROUTES)).toEqual([
      { view: ROUTE_TOKENS.assessmentSettings, path: `${ROUTE_TOKENS.baseline}/${ROUTE_TOKENS.assessmentSettings}` },
      { view: ROUTE_TOKENS.operations, path: `${HEAT_BALANCE_BASE}/${ROUTE_TOKENS.operations}` },
      { view: ROUTE_TOKENS.chargeMaterial, path: `${HEAT_BALANCE_BASE}/${ROUTE_TOKENS.chargeMaterial}` },
      { view: ROUTE_TOKENS.wallLosses, path: `${HEAT_BALANCE_BASE}/${ROUTE_TOKENS.wallLosses}` },
      { view: ROUTE_TOKENS.extendedSurface, path: `${HEAT_BALANCE_BASE}/${ROUTE_TOKENS.extendedSurface}` },
      { view: ROUTE_TOKENS.atmosphere, path: `${HEAT_BALANCE_BASE}/${ROUTE_TOKENS.atmosphere}` },
      { view: ROUTE_TOKENS.fixture, path: `${HEAT_BALANCE_BASE}/${ROUTE_TOKENS.fixture}` },
      { view: ROUTE_TOKENS.cooling, path: `${HEAT_BALANCE_BASE}/${ROUTE_TOKENS.cooling}` },
      { view: ROUTE_TOKENS.opening, path: `${HEAT_BALANCE_BASE}/${ROUTE_TOKENS.opening}` },
      { view: ROUTE_TOKENS.other, path: `${HEAT_BALANCE_BASE}/${ROUTE_TOKENS.other}` },
      { view: ROUTE_TOKENS.flueGas, path: `${HEAT_BALANCE_BASE}/${ROUTE_TOKENS.flueGas}` },
      { view: ROUTE_TOKENS.gasLeakage, path: `${HEAT_BALANCE_BASE}/${ROUTE_TOKENS.gasLeakage}` },
      { view: ROUTE_TOKENS.auxiliaryPower, path: `${HEAT_BALANCE_BASE}/${ROUTE_TOKENS.auxiliaryPower}` },
      { view: ROUTE_TOKENS.energyInputExhaustGas, path: `${HEAT_BALANCE_BASE}/${ROUTE_TOKENS.energyInputExhaustGas}` },
      { view: ROUTE_TOKENS.energyInput, path: `${HEAT_BALANCE_BASE}/${ROUTE_TOKENS.energyInput}` },
      { view: ROUTE_TOKENS.exhaustGas, path: `${HEAT_BALANCE_BASE}/${ROUTE_TOKENS.exhaustGas}` },
      { view: ROUTE_TOKENS.slag, path: `${HEAT_BALANCE_BASE}/${ROUTE_TOKENS.slag}` },
      { view: ROUTE_TOKENS.heatSystemEfficiency, path: `${HEAT_BALANCE_BASE}/${ROUTE_TOKENS.heatSystemEfficiency}` },
      { view: ROUTE_TOKENS.auxiliaryEquipment, path: `${ROUTE_TOKENS.baseline}/${ROUTE_TOKENS.auxiliaryEquipment}` },
      { view: ROUTE_TOKENS.designedEnergy, path: `${ROUTE_TOKENS.baseline}/${ROUTE_TOKENS.designedEnergy}` },
      { view: ROUTE_TOKENS.meteredEnergy, path: `${ROUTE_TOKENS.baseline}/${ROUTE_TOKENS.meteredEnergy}` },
      /** `assessment`'s target is its bare path; the router's own `redirectTo` resolves it, same as `report` below. */
      { view: ROUTE_TOKENS.assessment, path: ROUTE_TOKENS.assessment },
      { view: ROUTE_TOKENS.report, path: ROUTE_TOKENS.report },
    ]);
  });

  it('ignores redirect-only entries and nodes without a stepIndex', () => {
    const routes: Route[] = [
      { path: '', redirectTo: 'a', pathMatch: 'full' },
      { path: 'a', data: { mainView: 'a' } },
      { path: 'b', data: { mainView: 'b', stepIndex: 0 } },
    ];

    expect(deriveSteppedRoutes(routes)).toEqual([{ view: 'b', path: 'b' }]);
  });

  it('orders entries by stepIndex regardless of tree order', () => {
    const routes: Route[] = [
      { path: 'second', data: { mainView: 'second', stepIndex: 1 } },
      { path: 'first', data: { mainView: 'first', stepIndex: 0 } },
    ];

    expect(deriveSteppedRoutes(routes)).toEqual([
      { view: 'first', path: 'first' },
      { view: 'second', path: 'second' },
    ]);
  });
});
