import { Injectable, inject } from '@angular/core';
import { PlotlyService } from 'angular-plotly.js';
import { TraceData } from '../../models/plotting';

export interface ReportChartRenderOptions {
  width?: number;
  height?: number;
}

@Injectable({ providedIn: 'root' })
export class ReportChartRenderService {
  private readonly plotlyService = inject(PlotlyService);

  async renderChartToImage(traces: TraceData[], layout: object, opts: ReportChartRenderOptions = {}): Promise<string> {
    const width = opts.width ?? 1400;
    const height = opts.height ?? 700;

    const div = document.createElement('div');
    div.style.cssText = `position:absolute;left:-9999px;top:-9999px;width:${width}px;height:${height}px`;
    document.body.appendChild(div);

    const plotly = await this.plotlyService.getPlotly();
    try {
      await plotly.newPlot(div, traces, layout, { staticPlot: true, displaylogo: false });
      return await plotly.toImage(div, { format: 'jpeg', width, height });
    } finally {
      plotly.purge(div);
      document.body.removeChild(div);
    }
  }
}
