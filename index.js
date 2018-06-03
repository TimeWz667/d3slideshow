import {SlideShow} from "./src/slideshow"


const layout_template = '<div><div id="title"><h1>{{ Title }}</h1></div>' +
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

export function create(app_tag, title) {
    d3.select(app_tag).node().innerHTML = layout_template;
    return new SlideShow(app_tag, title);
}
