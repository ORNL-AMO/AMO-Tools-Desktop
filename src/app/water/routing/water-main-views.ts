import { WaterMainTabString } from '../water-assessment.service';

/**
 * Array order is the banner chevron order. The assessment tab is not implemented yet.
 * Kept apart from water.routing.ts, whose component imports would make WaterAssessmentService import circular.
 */
export const WATER_MAIN_VIEWS: Array<WaterMainTabString> = ['baseline', 'diagram', 'report'];
