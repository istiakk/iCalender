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

        private element: JQuery;

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

        /* One time setup*/
        public init(options: VisualInitOptions): void {
            this.element = options.element;
        }

        /* Called for data, size, formatting changes*/ 
        public update(options: VisualUpdateOptions) {}

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