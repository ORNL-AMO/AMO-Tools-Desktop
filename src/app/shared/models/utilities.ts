export interface MeasurMessageData {
    show: boolean,
    msg?: string,
    detailHTML?: string,
    objectType?: string,
    objectRefs?: Array<MeasurObjectRef>,
    dismissButtonText?: string
}

export interface MeasurObjectRef {
    id: string, 
    name: string
}