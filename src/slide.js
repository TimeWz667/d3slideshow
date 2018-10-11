export class Slide {
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
