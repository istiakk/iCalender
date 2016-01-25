/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved. 
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *   
 *  The above copyright notice and this permission notice shall be included in 
 *  all copies or substantial portions of the Software.
 *   
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

/* Please make sure that this path is correct */
/// <reference path="../_references.ts"/>

// adding module d3
declare module D3 {
    export module Time {
        export interface Time {
            weekOfYear(x: any): any;//this is missing from d3.d.ts
        }
    }
}



module powerbi.visuals {

    // declearnig the values in DateValues
    export interface DateValue {
        date: Date;
        value: number;
    };

    //assigning the values in ViewModel
    export interface CalenderViewModel {
        values: DateValue[];
    };

    export class iCalenderVisual implements IVisual {
		/**
		  * Informs the System what it can do
		  * Fields, Formatting options, data reduction & QnA hints
		  */
        public static capabilities: VisualCapabilities = {
            dataRoles: [
                {
                    name: "Category",
                    kind: VisualDataRoleKind.Grouping
                },
                {
                    name: "Y",
                    kind: VisualDataRoleKind.Measure
                }
            ],
            dataViewMappings: [{
                categorical: {
                    categories: {
                        for: { in: 'Category' },
                    },
                    values: {
                        // values of Y
                        for: { in: 'Y' }
                    },
                    // rowcount which is maxed 2 // Need to know why !
                    rowCount: { preferred: { max: 2 } }
                },
            }],

            dataPoint: {
                 // Need to know more about createDisplayNameGetter
                // Naming it to display name Visual_dataPoint
                displayName: data.createDisplayNameGetter('Visual_DataPoint'),
                properties: {
                    fill: {
                        displayName: data.createDisplayNameGetter('Visual_Fill'),
                        type: { fill: { solid: { color: true } } }
                    },
                }
            },

            labels: {
                displayName: data.createDisplayNameGetter('Visual_DataPointsLabels'),
                properties: {
                    // how many different kinds of properties it contains
                    show: {
                        displayName: data.createDisplayNameGetter('Visual_Show'),
                        type: { bool: true }
                    },
                    color: {
                        displayName: data.createDisplayNameGetter('Visual_LabelsFill'),
                        type: { fill: { solid: { color: true } } }
                    },
                    labelDisplayUnits: {
                        displayName: data.createDisplayNameGetter('Visual_DisplayUnits'),
                        type: { formatting: { labelDisplayUnits: true } }
                    }
                }
            }
        };

        private drawMonthPath = false;
        private drawLegend = false;
        private drawLabels = true;
        private width = 1016;
        private height = 144;
        private cellSize = 24; // cell size
        private element = HTMLElement;
        private rect: D3.Selection; // using d3

        // constructor for the cell size
        constructor(cellSizeOpt?= number) {
            if (cellSizeOpt) {
                this.cellSize = cellSizeOpt; // assign the cellsize within the constructor
            }
        }


        /* One time setup*/
        public init(options: VisualInitOptions): {
            this.element = options.element.get(0); // why it is the first element, need to know
        }

        /* Called for data, size, formatting changes*/ 
        public update(options: VisualUpdateOptions) {
        d3.select(this.element).selectAll("*").remove();
        var viewModel = this.convert(options.dataViews[0]);

        if (viewModel == null) return;

        var maxDomain = Math.max.apply(Math,
        viewModel.values.map((v) => {
                return v.value;
            })
        );

        this.draw(this.element, options.viewport.width, options.viewport.width, options.viewport.height, this.getYears(viewModel), maxDomain);
        this.apply(viewModel, maxDomain);
        }


        private draw(element, itemWidth: number, itemHeight: number, range: number[], maxDomain: number)
        {
    var format = d3.time.format("%Y-%m-%d");
    var svg = d3.select(element).selectAll("svg")
        .data(range)
        .enter().append("svg")
        .attr("width", itemWidth)
        .attr("height", itemWidth / 7) // why not itemHeight
        .attr("viewBox", "0 0 " + this.width + " " + this.height) // wht there is a " " between the height and widht
        .append("g") // what is this "g"
        .attr("transform", "translate(" + ((this.width - this.cellSize * 52) / 2) + "," + (this.height - this.cellSize * 7 - 1) + ")");

    if (this.drawLabels) {
        var textGroup = svg.append("g").attr("fill", "#cccccc");
        textGroup.append("text")
            .attr("transform", "translate(" + this.cellSize * -1.5 + "," + this.cellSize * 3.5 + ")rotate(-90)")
            .style("text-anchor", "middle")
            .text(function (d) { return d; });

        textGroup.append("text")
            .style("text-anchor", "middle")
            .text("M")
            .attr("transform", "translate(" + this.cellSize * -0.75 + ")")
            .attr("x", 0)
            .attr("y", 2 * this.cellSize);

        textGroup.append("text")
            .style("text-anchor", "middle")
            .text("W")
            .attr("transform", "translate(" + this.cellSize * -0.75 + ")")
            .attr("x", 0)
            .attr("y", 2 * this.cellSize);
        
        textGroup.append("text")
            .style("text-anchor", "middle")
            .text("F")
            .attr("transform", "translate(" + this.cellSize * -0.75 + ")")
            .attr("x", 0)
            .attr("y", 2 * this.cellSize);

        textGroup.append("text")
            .attr("transform", "translate(" + (this.width - (3 * this.cellSize)) + "," + this.cellSize * 3.5 + ")rotate(90)")
            .style("text-anchor", "middle")
            .text(function (d) { return d; });

    }

}

        // Convert a DataView into a view model
        public static converter(dataView: DataView): CalenderViewModel {
            return {
                displayName: {
                    name: {
                        displayName: data.createDisplayNameGetter('Coverter'),
                        type: { formatting: { label: true } }
                    },

                    name: {

                    }
                }

            };
        }



        /*About to remove your visual, do clean up here */ 
        public destroy() {}
    }
}

/* Creating IVisualPlugin that is used to represent IVisual. */
//
// Uncomment it to see your plugin in "PowerBIVisualsPlayground" plugins list
// Remember to finally move it to plugins.ts
//
//module powerbi.visuals.plugins {
//    export var iCalenderVisual: IVisualPlugin = {
//        name: 'iCalenderVisual',
//        capabilities: iCalenderVisual.capabilities,
//        create: () => new iCalenderVisual()
//    };
//}