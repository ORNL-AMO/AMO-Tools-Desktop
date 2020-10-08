export interface FsatSankeyNode {
    name: string,
    value: number,
    loss?: number,
    source?: number,
    target?: number[],
    x: number,
    y: number,
    nodeColor: string,
    id?: string,
    isConnector: boolean
}