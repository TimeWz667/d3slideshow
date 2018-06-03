export class Figure {
    constructor (name, init) {
        this.Name = name;
        this.g = null;
        this.elements = {};
        this.width = 0;
        this.height = 0;
        this.init = init || function() {};
    }

    initialise (g, width, height) {
        this.width = width;
        this.height = height;
        this.g = g.append("g").attr("id", this.Name);
        this.init();
        this.hide();
    }

    show (t) {
        if (this.g !== null) {
            this.g.transition().duration(t||0).attr("opacity", 1);
        }
    }


    hide (t) {
        if (this.g !== null) {
            this.g.transition().duration(t || 0).attr("opacity", 0);
        }
    }

    event (key, value) {
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