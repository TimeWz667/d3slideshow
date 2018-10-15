import {SlideShow} from "./src/slideshow"
import {ScrollingShow} from "./src/scrollingshow"

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


const slide_template = '<div class="row" style="padding: 30px; height: 95vh">' +
    '<div class="col-sm-12"><ul class="nav nav-tabs">' +
    '<li id="nav-ch" v-for="ch in Chapters">' +
    '<a href="#"> {{ ch }}</a>' +
    '</li></ul></div>' +

    '<div class="col-sm-4 col-xs-12" style="height: 100%;">' +
    '<section class="slide">' +
    // '<div class="prefix"></div>' +
    '<div class="chapter"><h3>{{ CurrentChapter }}</h3></div>' +
    '<div class="section">{{ CurrentSlide.Section }}</div>' +
    '<div v-html="CurrentSlide.Context"></div>' +
    '</section>' +
    '</div>' +
    '<div class="col-sm-8 col-xs-12" style="height: 100%;"><div id="canvas-slide"></div></div>' +
    '<div id="page-footer"><ul class="pager">' +
    '<li class="previous"><a href="#">Previous</a></li>' +
    '<li class="next"><a href="#">Next</a></li>' +
    '</ul></div>' +
    '</div>';


export function highlight(figs, name, dt) {
    Object.values(figs).filter(fig => fig.Name !== name).forEach(fig => fig.hide(dt));
    let fig = figs[name];
    if (fig != null) {
        fig.show(dt);
        return fig;
    }
}

export function hideAll(figs) {
    Object.values(figs).forEach(function(fig) {
        fig.hide(0);
    })
}

export function create(app_tag, title, type="Scrolling") {
    if (type === "Scrolling") {
        d3.select(app_tag).node().innerHTML = scrolling_template;
        return new Scrolling(app_tag, title);
    } else {
        d3.select(app_tag).node().innerHTML = slide_template;
        return new SlideShow(app_tag, title);
    }

}
