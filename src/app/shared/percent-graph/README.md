# Percent Graph

Percent graph is a component wrapper for an `ng2-charts` npm module.

It takes the following inputs:
--the percentage you wish to display
`value: number`
--the title for the graph
`title: string`
--a description of your value displayed on hover
`valueDescription: string`
--a font style for title
`fontStyle: string`
--a font size for title
`fontSize: string`
--unit for the value
`unit: string`

#Usage

To include in a component add the SharedModule to the desired components root module

Then simply add the PercentGraphComponent to the html of the desired component

<app-percent-graph [value]="10"></app-percent-graph>

all inputs are optional