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
        const lyo = this.Layout;

        var chapters = this.Slides
            .map(sl => sl.Chapter)
            .filter((v, i, a) => a.indexOf(v) === i);

        var sections = chapters.reduce((acc, ch) => {
            acc[ch] = this.Slides.filter(sl => sl.Chapter === ch)
                .map(sl => sl.Section)
                .filter((v, i, a) => a.indexOf(v) === i);
            return acc;
        }, {})

        this.App = new Vue({
            el: this.TagApp,
            data: {
                Slides: d3.nest().key(sl => sl.Chapter).entries(this.Slides).reduce((acc, v) => {
                    acc[v.key] = v.values;
                    return acc;
                }, {}),
                Title: this.Title,
                CurrentChapter: chapters[0],
                CurrentSection: sections[chapters[0]][0],
                CurrentPage: 1,
                CurrentSlide: this.Slides[0],
                Chapters: chapters,
                Sections: sections,
                svg: null,
                g: null,
                isPrepared: false
            },
            mounted: function () {
                //d3.select(this.$el).select("#sections").style("width", lyo.Prop * 100 + "%")
                d3.select(this.$el)
                    .selectAll("#nav-ch")
                    .on("click", (d, i) => {
                        this.CurrentChapter = this.Chapters[i];
                    })


                d3.select(this.$el)
                    .select(".previous")
                    .classed("disabled", this.LastPage === false)
                    .on("click", (d, i) => {
                        if (this.LastPage) this.CurrentPage = this.LastPage;
                    });

                d3.select(this.$el)
                    .select(".next")
                    .classed("disabled", this.NextPage === false)
                    .on("click", (d, i) => {
                        if (this.NextPage) this.CurrentPage = this.NextPage;
                    });

                const canvas = d3.select(this.$el).select("#canvas");
                //canvas.style("width", 95 - lyo.Prop * 100 + "%");

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

            },
            computed: {
                /**
                 * @return {number, boolean}
                 */
                LastPage: function () {
                    if (this.CurrentPage === 1) {
                        return false;
                    } else {
                        return this.CurrentPage - 1;
                    }
                },
                /**
                 * @return {number, boolean}
                 */
                NextPage: function () {
                    if (this.CurrentPage === this.Slides[this.CurrentChapter].length) {
                        return false;
                    } else {
                        return this.CurrentPage + 1;
                    }
                }
            },
            methods: {
                activate: function () {
                    if (this.Page > 0) {
                        this.Slides[this.Page - 1].activate(this.Figures);
                    }
                }
            },
            watch: {
                CurrentChapter: function () {
                    if (!this.isPrepared) {
                        return;
                    }
                    this.CurrentPage = 1;

                    d3.select(this.$el).select(".next")
                        .classed("disabled", this.NextPage === false);

                    this.CurrentSlide = this.Slides[this.CurrentChapter][this.CurrentPage - 1];
                    this.activate();
                },
                CurrentPage: function () {
                    if (!this.isPrepared) {
                        return;
                    }

                    d3.select(this.$el).select(".previous")
                        .classed("disabled", this.LastPage === false);

                    d3.select(this.$el).select(".next")
                        .classed("disabled", this.NextPage === false);

                    this.CurrentSlide = this.Slides[this.CurrentChapter][this.CurrentPage - 1];
                    this.activate();
                }
            }
        });
    }
}
