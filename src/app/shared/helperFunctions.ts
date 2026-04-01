import { cloneDeep } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { FlatColors, graphColors } from './graphColors';
import { SimpleChart } from './models/plotting';

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


export const getGraphColors = (): Array<string> => {
    return [...graphColors];
};


export function getRandomFlatColor(): string {
    let randomIndex = Math.floor(Math.random() * FlatColors.length);
    return FlatColors[randomIndex];
}


// Returns a Plotly config object with base options, merging any provided config
export function defaultPlotlyConfig(config?: Partial<SimpleChart['config']>): Partial<SimpleChart['config']> {
    const mergedConfig = {
        modeBarButtonsToRemove: ['select2d', 'lasso2d'],
        displaylogo: false,
        displayModeBar: true,
        responsive: true,
        ...config
    };
    return mergedConfig;
}
