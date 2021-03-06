import * as d3 from 'd3';
import { Component, ElementRef, AfterViewInit } from '@angular/core';

declare let L: any;

@Component({
    selector: 'progress-chart',
    template: ``
})
export class ProgressChart implements AfterViewInit {

    private progressNode: any;
    private textNode: any;
    private progress: number = Math.random();
    private animationDuration: number = 400;
    private animationDelay: number = Math.random() * 1000;
    private twoPi = 2 * Math.PI;
    private formatPercent: Function = d3.format('.0%');
    private colors = ['#e91e63', '#FFAC40', '#ff3d00', '#4caf50'];

    constructor(private elementRef: ElementRef) { }

    ngAfterViewInit() {
        // this.render();
        L.map(this.elementRef.nativeElement, {
            center: [51.505, -0.09],
            zoom: 13
        });
    }

    protected render() {

        let border = 15;
        let padding = 2;
        let radius = 100;
        let fontSize = 45;
        let noText = false;
        let color = '#00357b';
        let boxSize = (radius + padding + border) * 2;

        let parent = d3.select(this.elementRef.nativeElement);
        let svg = parent.append('svg')
            .attr('width', '230')
            .attr('height', '230');

        let arc = d3.svg.arc()
            .innerRadius(radius - border)
            .outerRadius(radius)
            .startAngle(0);

        let g = svg.append('g')
            .attr('transform', `translate(${boxSize / 2}, ${boxSize / 2})`);

        let meter = g.append('g');

        let backgroundFill = '#fff';
        let formatPercent = this.formatPercent;

        // inner circular background
        meter.append('circle')
            .attr('class', 'background')
            .attr('fill', backgroundFill)
            .attr('r', radius - border);

        // Add the background arc, from 0 to 100% (this.twoPi).
        meter.append('path')
            .datum({ endAngle: this.twoPi })
            .style('fill', '#CCC')
            .style('fill-opacity', 0.5)
            .attr('d', arc);

        // Add text
        let textNode = meter.append('text')
            .attr('fill', this.colors[0])
            .attr('text-anchor', 'middle')
            .attr('font-size', fontSize)
            .attr('dy', '.35em')
            .text(this.formatPercent(0))
            .datum({ value: 0 });

        this.data.map((data, index) => {
            setTimeout(() => {

                // Add the foreground arc in orange, currently showing 12.7%.
                meter.append('path')
                    .datum({ endAngle: 0 })
                    .style('fill', this.colors[index + 1])
                    .attr('d', arc)
                    .transition()
                    .duration(this.animationDuration)
                    .call((transition, newAngle) => {
                        transition.attrTween('d', (d: any) => {
                            let interpolate = d3.interpolateNumber(d.endAngle, newAngle);
                            return function (t: number) {
                                d.endAngle = interpolate(t);
                                return arc(d);
                            };
                        });
                    }, data * this.twoPi);


            }, this.animationDelay);

        });
        textNode.transition()
            .duration(this.animationDuration)
            .tween('text', () => {
                let interpolate = d3.interpolateRound(0, this.data[0] * 100);
                return function (t: number) {
                    this.textContent = formatPercent(interpolate(t) / 100);
                };
            });
    }

    get data() {
        return [0.1, 0.3, 0.4].sort().reverse();
    }
}