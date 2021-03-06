var d3slideshow = (function (exports) {
    'use strict';

    class Slide {
        constructor (chapter, section, context, act, update) {
            this.Texts = {
                Chapter: chapter || '',
                Section: section || '',
                Context: context || ''
            };

            this.Events = {
                activate: act || function () {},
                update: update || function () {}
            };
        }

        text (key, value) {
            if (this.Texts.hasOwnProperty(key)) {
                if (arguments.length > 1) {
                    this.Texts[key] = value;
                } else {
                    return this.Texts[key];
                }
            }
            return this;
        }

        event (key, value) {
            if (this.Events.hasOwnProperty(key)) {
                if (arguments.length > 1) {
                    this.Events[key] = value;
                } else {
                    return this.Events[key];
                }
            }
            return this;
        }

    }

    Object.defineProperty(Slide.prototype, 'Chapter', {
        get: function () {
            return this.text('Chapter');
        }
    });

    Object.defineProperty(Slide.prototype, 'Section', {
        get: function () {
            return this.text('Section');
        }
    });

    Object.defineProperty(Slide.prototype, 'Context', {
        get: function () {
            return marked(this.text('Context'));
        }
    });

    Object.defineProperty(Slide.prototype, 'activate', {
        get: function () {
            return this.event('activate');
        }
    });

    Object.defineProperty(Slide.prototype, 'update', {
        get: function () {
            return this.event('update');
        }
    });

    class Figure {
        constructor(name, init) {
            this.Name = name;
            this.g = null;
            this.elements = {};
            this.width = 0;
            this.height = 0;
            this.init = init || function () {};
        }

        initialise(g, width, height) {
            this.width = width;
            this.height = height;
            this.g = g.append("g").attr("id", this.Name);
            this.init();
            this.hide();
        }

        show(t) {
            if (this.g !== null) {
                this.g.transition().duration(t || 0).style("display", "inline");
            }
        }


        hide(t) {
            if (this.g !== null) {
                this.g.transition().duration(t || 0).style("display", "none");
            }
        }

        event(key, value) {
            if (arguments.length > 1) {
                this[key] = value;
                return this;
            }
            if (this.hasOwnProperty(key)) {
                return this[key];
            }
            return this;
        }

    }

    class SlideShow {
        constructor(app_tag, title) {
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

        layout(key, value) {
            if (arguments.length > 1) {
                this.Layout[key] = value;
                return this;
            }
            if (this.Layout.hasOwnProperty(key)) {
                return this.Layout[key];
            }
            return this;
        }

        appendSlide(slide) {
            let s = slide || new Slide();
            this.Slides.push(s);
            return s;
        }

        appendFigure(figure) {
            if (typeof figure === "string") {
                figure = new Figure(figure);
            }
            this.Figures[figure.Name] = figure;
            return figure;
        }

        start() {
            const lyo = this.Layout;

            var chapters = this.Slides
                .map(sl => sl.Chapter)
                .filter((v, i, a) => a.indexOf(v) === i);

            var sections = chapters.reduce((acc, ch) => {
                acc[ch] = this.Slides.filter(sl => sl.Chapter === ch)
                    .map(sl => sl.Section)
                    .filter((v, i, a) => a.indexOf(v) === i);
                return acc;
            }, {});

            this.App = new Vue({
                el: this.TagApp,
                data: {
                    Slides: d3.nest().key(sl => sl.Chapter).entries(this.Slides).reduce((acc, v) => {
                        acc[v.key] = v.values;
                        return acc;
                    }, {}),
                    Figures: this.Figures,
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
                        });


                    d3.select(this.$el)
                        .select("#previous")
                        .classed("disabled", this.LastPage === false)
                        .on("click", (d, i) => {
                            if (this.LastPage) this.CurrentPage = this.LastPage;
                        });

                    d3.select(this.$el)
                        .select("#next")
                        .classed("disabled", this.NextPage === false)
                        .on("click", (d, i) => {
                            if (this.NextPage) this.CurrentPage = this.NextPage;
                        });

                    const canvas = d3.select(this.$el).select("#canvas-slide");
                    //canvas.style("width", 95 - lyo.Prop * 100 + "%");

                    lyo.Width = parseFloat(canvas.style("width").split("px")[0]);
                    lyo.Height = parseFloat(canvas.style("height").split("px")[0]);


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
                    this.activate();
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
                        this.CurrentSlide.activate(this.Figures);
                    }
                },
                watch: {
                    CurrentChapter: function () {
                        if (!this.isPrepared) {
                            return;
                        }
                        this.CurrentPage = 1;

                        d3.select(this.$el).select("#next")
                            .classed("disabled", this.NextPage === false);

                        this.CurrentSlide = this.Slides[this.CurrentChapter][this.CurrentPage - 1];
                        this.activate();
                    },
                    CurrentPage: function () {
                        if (!this.isPrepared) {
                            return;
                        }

                        d3.select(this.$el).select("#previous")
                            .classed("disabled", this.LastPage === false);

                        d3.select(this.$el).select("#next")
                            .classed("disabled", this.NextPage === false);

                        this.CurrentSlide = this.Slides[this.CurrentChapter][this.CurrentPage - 1];
                        this.activate();
                    }
                }
            });
        }
    }

    class ScrollingShow {
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

                    d3.select(this.$el).select("#sections").style("width", lyo.Prop * 100 + "%");


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
                        this.activate(this.page);
                    },
                    Progress: function () {
                        //console.log('update to ' + this.Progress)
                        this.update(this.page, this.progress);
                    }
                }
            });
        }
    }

    const scrolling_template = '<div><div id="title"><h1>{{ Title }}</h1></div>' +
        '<div id="slides"><div id="sections">' +
        '<section class="slide" v-for="slide in Slides" v-bind:slide="slide">' +
        '<div class="prefix"></div>' +
        '<div class="chapter">{{ slide.Chapter }}</div>' +
        '<div class="section">{{ slide.Section }}</div>' +
        '<div v-html="slide.Context"></div>' +
        '</section></div>' +
        '<div id="canvas"></div><div id="extra-space"></div>' +
        '</div>' +
        '<div id="pager">Page {{ Page }}: {{ (100*Progress).toFixed() }}% </div>' +
        '</div>';


    const slide_template = '<div class="row" style="padding: 10px; height: 85vh">' +
        '<div class="col-sm-12"><ul class="nav nav-tabs">' +
        '<li id="nav-ch" v-for="ch in Chapters">' +
        '<a href="#"> {{ ch }}</a>' +
        '</li></ul></div>' +

        '<div class="col-sm-4 col-xs-12" style="height: 100%">' +
        '<div class="slide">' +
        '<div class="chapter">{{ CurrentSlide.Chapter }}</div>' +
        '<div class="section">{{ CurrentSlide.Section }}</div>' +
        '<div class="context" v-html="CurrentSlide.Context"></div>' +
        '</div>' +

        '<div class="col-sm-12 col-xs-12" id="page-footer">' +
        '<div class="btn-group btn-group-justified">' +
        '<div class="btn btn-default" id="previous">Previous</div>' +
        '<div class="btn btn-default" id="next">Next</div>' +
        '</div>' +
        '</div>' +
        '</div>' +

        '<div class="col-sm-8 col-xs-12" style="height: 100%;">' +
        '<div id="canvas-slide"></div>' +
        '</div>' +
        '</div>';


    function highlight(figs, name, dt) {
        Object.values(figs).filter(fig => fig.Name !== name).forEach(fig => fig.hide(dt));
        let fig = figs[name];
        if (fig != null) {
            fig.show(dt);
            return fig;
        }
    }

    function hideAll(figs) {
        Object.values(figs).forEach(function (fig) {
            fig.hide(0);
        });
    }

    function create(app_tag, title, type = "Scrolling") {
        if (type === "Scrolling") {
            d3.select(app_tag).node().innerHTML = scrolling_template;
            return new ScrollingShow(app_tag, title);
        } else {
            d3.select(app_tag).node().innerHTML = slide_template;
            return new SlideShow(app_tag, title);
        }

    }

    exports.highlight = highlight;
    exports.hideAll = hideAll;
    exports.create = create;

    return exports;

}({}));
