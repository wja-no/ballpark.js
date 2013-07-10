frontend-performance
====================

Finished tests:
* Just a basic HTML page
* jQuery loaded locally
* jQuery loaded from CDN
* jQuery + jQuery UI (all of it) loaded locally
* Background-images set in CSS, using files
* Background-images set in CSS, base64-encoded in the stylesheet 
* Custom iconfont with 300 chars, import entire font, use subset of 50 chars.
* Custom iconfont with 50 chars, use entire font.
* Facebook like-box
* Google Fonts loaded locally
* Google Fonts loaded from CDN
* Google Fonts loaded locally, base64-encoded straight into the stylesheet
* HTML file with small stylesheet, small script file
* HTML file with ten small stylesheets, ten small script files
* 1136x640 pixel JPEG image
* 2880x1800 pixel JPEG image
* Twitter Bootstrap, default setup, everything included
* 36 small avatars on the same page: 
  - black and white 32x32
  - color 48x48

Tests we need:

* Composite, worst-case demonstration
* Composite, best-case demonstration

Possible test topics:

(As suggested by Yslow and Google PageSpeed)

- Impact og Gzipping components
- Placement of stylesheet in html document (top preferred)
- Placement of scripts in html document (bottom preferred)
- Impact of minification
- ETags
- Impact of # DOM-elements
- Impact of # DOM-accesses in scripts
- Impact of excessive iframe usage
- Impact of Cookie-size
- Excessive use of Event Handlers: "If you have 10 buttons inside a div, attach only one event handler to the div wrapper, instead of one handler for each button." - Yslow
- Using images naively versus optimizing images
- When choosing to use CSS sprites: best practices.
- Impact of component size (ie. iPhone will not cache components > 25KB)
- Impact of various HTTP caching techniques
- Using every CSS declaration just once
- Best practices wrt. minimizing browser reflow. 
- JavaScript memoryleaks
- JavaScript best practices
- Prefetching resources
- speedups gained by HTML5 features
