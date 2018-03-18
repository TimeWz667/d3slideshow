# d3slideshow

A data visualisation slideshow generating package


## Requirements

- d3.js
- vue.js
- marked.js
- scroller (see http://vallandingham.me/scroller.html)

### Getting Started

Download and load the module and its stylesheet

```
<script src="d3slideshow.js"></script>
<link rel="stylesheet" type="text/css" href="d3slideshow.css" />
```



#### Step 1: prepare a HTML container

```
<div id="example"></div>
```

#### Step 2: create a new slideshow in the container

```
const show = d3slideshow.create("#example", "This is an example of d3slideshow")
    .layout("YXratio", 0.8)
    .layout("Prop", 0.3);
```

##### Layout options

- <b> YXratio </b> height/width of the visualisation canvas; default: 0.8  
- <b> Prop </b> proportion of the description column; default: 0.3

#### Step 3: add a new figure

```
show.appendFigure("FigureA") // the name of figure is required
    .event("init", function() {
        // code for initialise a graph
        // please add svg elements to this.g
      })
```


#### Step 4: add a new slide

```
show.appendSlide()
    .text("Chapter", 'Chapter A')
    .text("Section", 'Section A')
    .text("Context", ' some context with mark down ')
    .event("activate", function(figs) {})
    .event("update", function(figs, progress) {});
```

<b>activate</b> is called when the slide is on the current page. <b>figs</b> is a dictionary of figures with keys of their names.

<b>update</b> is called when scrolling. <b>progress</b> is a number ranged from 0 to 1.





#### Additional functions

Show and fetch the indicated figure and hide all the others
```
d3slideshow.highlight(figs, "FigureA") # in <b>activate</b>
```


#### A full example
See https://github.com/TimeWz667/d3slideshow-example




## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
