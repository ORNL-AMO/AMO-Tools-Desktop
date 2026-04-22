import { cloneDeep } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { FlatColors, graphColors } from './graphColors';
import { SimpleChart } from './models/plotting';
import { TraceData } from './models/plotting';
export function copyObject(object) {
    return cloneDeep(object);
}

export function truncate(text: string, specifiedLimit?: number) {
    let limit = specifiedLimit ? specifiedLimit : 50;
    if (text.length > limit) {
        return text.slice(0, limit) + '...'
    } else {
        return text;
    }
}


/**
 * Rounds a value to a specified number of decimal places. Default is 3
 * @returns 
 */
export function roundVal(val: number, places: number = 3): number {
    let rounded = Number(val.toFixed(places));
    return rounded;
}

export function getNewIdString() {
    return uuidv4();
}

export function getNameDateString(currentDate: Date) {
    const dateStr = (currentDate.getMonth() + 1) + '-' + currentDate.getDate() + '-' + currentDate.getFullYear();
    return dateStr;
}


export type FormControlIds<T> = {
  [K in keyof T]: string;
};


export const generateFormControlIds = <T extends Record<string, any>>(obj: T): FormControlIds<T> => {
  const result = {} as FormControlIds<T>;
  const idString = getNewIdString();
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[key] = `${idString}_${key}`;
    }
  }
  return result;
}

export const getGraphColors = (): Array<string> => {
    return [...graphColors];
};


export function getRandomFlatColor(): string {
    let randomIndex = Math.floor(Math.random() * FlatColors.length);
    return FlatColors[randomIndex];
}


  /**
 * defaultPlotlyConfig
 *
 * @param {object} config - as object, generally expected as Partial<SimpleChart['config']>
 * @param {string} chartType - as string or an unknown
 * @returns {object} mergedConfig - the default config merged with the provided config, with some adjustments based on chart type, expected to fit Partial<SimpleChart['config']>.
 */
export function defaultPlotlyConfig(config?: object, chartType?: string | unknown): object {
    let modeBarButtonsToRemove = ['select2d', 'lasso2d'];
    if (chartType) {
        if (Array.isArray(chartType)) {
            if (chartType.some(t => ['pie', 'bar'].includes(t.type))) {
                modeBarButtonsToRemove.push('zoom2d', 'zoomin2d', 'zoomout2d');
            }
            if (chartType.some(t => t.type && t.type.startsWith('scatter'))) {
                modeBarButtonsToRemove = modeBarButtonsToRemove.filter(button => !['zoom2d', 'zoomin2d', 'zoomout2d'].includes(button));
            }
        } else if (typeof chartType === 'string') {
            if (['pie', 'bar'].includes(chartType)) {
                modeBarButtonsToRemove.push('zoom2d', 'zoomin2d', 'zoomout2d');
            }
            if (chartType.startsWith('scatter')) {
                modeBarButtonsToRemove = modeBarButtonsToRemove.filter(button => !['zoom2d', 'zoomin2d', 'zoomout2d'].includes(button));
            }
        }
    }

    const mergedConfig = {
        modeBarButtonsToRemove: modeBarButtonsToRemove,
        displaylogo: false,
        displayModeBar: true,
        responsive: true,
        ...config
    };
    return mergedConfig;
}
