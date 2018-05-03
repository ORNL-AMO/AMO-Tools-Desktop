import { DesignedEnergy } from '../../../shared/models/phast/designedEnergy';
import { MeteredEnergy } from '../../../shared/models/phast/meteredEnergy';
import { Settings } from '../../../shared/models/settings';

export interface PreAssessment {
    designedEnergy?: DesignedEnergy,
    meteredEnergy?: MeteredEnergy,
    energyUsed?: number,
    name?: string,
    type?: string,
    settings?: Settings,
    collapsed?: boolean,
    collapsedState?: string,
    borderColor?: string
}
