import {Slide} from './slide'
import {Figure} from './figure'


export class SlideShow {
    constructor (app_tag, title) {
        this.Container = d3.select(app_tag);
        this.Title = title;
        this.TagApp = app_tag;

        this.Layout = {
            Margin: {
                top: 20,
                right: 30,
                bottom: 20,
                left: 20
            },
            YXratio: 0.8,
            Prop: 0.3
        };

        this.Figures = {};
        this.Slides = [];
    }

    layout (key, value) {
        if (arguments.length > 1) {
            this.Layout[key] = value;
            return this;
        }
        if (this.Layout.hasOwnProperty(key)) {
            return this.Layout[key];
        }
        return this;
    }

    appendSlide (slide) {
        let s = slide || new Slide();
        this.Slides.push(s);
        return s;
    }

    appendFigure (figure) {
        if (typeof figure === "string") {
            figure = new Figure(figure);
        }
        this.Figures[figure.Name] = figure;
        return figure;
    }


    start () {
        this.appendSlide();
        const lyo = this.Layout;

        this.App = new Vue({
            el: this.TagApp,
            data: {
                Slides: this.Slides,
                Figures: this.Figures,
                Title: this.Title,
                Page: 0,
                Progress: 0,
                SectionPositions: [],
                TitleTop: 0,
                svg: null,
                g: null,
                isPrepared: false
            },
            created: function () {
                d3.select(window)
                    .on("scroll.scroller", this.position)
                    .on("resize.scroller", this.resize);
            },
            mounted: function () {

                this.TitleTop = this.$el.getBoundingClientRect().top;

                d3.select(this.$el).select("#sections").style("width", lyo.Prop * 100 + "%")


                const canvas = d3.select(this.$el).select("#canvas");
                canvas.style("width", 95 - lyo.Prop * 100 + "%");
                lyo.Width = canvas.node().getBoundingClientRect().width;
                lyo.Height = lyo.Width * lyo.YXratio;
                canvas.style("height", lyo.Height + "px");

                lyo.gWidth = lyo.Width - lyo.Margin.left - lyo.Margin.right;
                lyo.gHeight = lyo.Height - lyo.Margin.top - lyo.Margin.bottom;

                this.svg = canvas.append("svg")
                    .attr("width", lyo.Width)
                    .attr("height", lyo.Height);

                this.g = this.svg.append("g")
                    .attr("transform", "translate(" + lyo.Margin.left + "," + lyo.Margin.top + ")");

                for (let fig in this.Figures) {
                    this.Figures[fig].initialise(this.g, lyo.gWidth, lyo.gHeight);
                }

                this.isPrepared = true;

                this.resize();
                d3.timeout(this.position, 200);
            },
            computed: {

            },
            methods: {
                position: function () {
                    const offset = 0;
                    const pos = offset - this.$el.getBoundingClientRect().top;
                    const currIndex = Math.min(this.Slides.length - 1, d3.bisect(this.SectionPositions, pos));
                    const prevIndex = Math.max(currIndex - 1, 0);
                    const prevTop = this.SectionPositions[prevIndex];
                    const prog = (pos - prevTop + offset) / (this.SectionPositions[currIndex] - prevTop);
                    this.Progress = (prog > 1) ? 0 : prog;
                    this.Page = (prog > 1) ? currIndex + 1 : currIndex;

                    const titleBot = d3.select(this.$el).select("#title").node().getBoundingClientRect().bottom;
                    d3.select(this.$el).select("#canvas").style("top", Math.max(titleBot, this.TitleTop) + 10 + "px");
                },
                resize: function () {
                    const containerTop = this.$el.getBoundingClientRect().top + window.pageYOffset;

                    this.SectionPositions = [];
                    let startPos;
                    let pos = this.SectionPositions;

                    d3.select(this.$el).selectAll(".slide").each(function (d, i) {
                        const top = this.getBoundingClientRect().top;
                        if (i === 0) {
                            startPos = top;
                        }
                        pos.push(top - startPos);
                    });

                },
                activate: function () {
                    if (this.Page > 0) {
                        this.Slides[this.Page - 1].activate(this.Figures);
                    }
                },
                update: function () {
                    if (this.Page > 0) {
                        this.Slides[this.Page - 1].update(this.Figures, this.Progress);
                    }
                }
            },
            watch: {
                Page: function () {
                    //console.log("activate page " + this.Page);
                    if (!this.isPrepared) {
                        return;
                    }
                    d3.selectAll(".slide")
                        .style("opacity", (d, i) => i === this.Page - 1 ? 1 : 0.1);
                    this.activate(this.page)
                },
                Progress: function () {
                    //console.log('update to ' + this.Progress)
                    this.update(this.page, this.progress)
                }
            }
        });
    }
}
