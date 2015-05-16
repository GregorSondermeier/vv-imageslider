=== VV Imageslider ===
Contributors: Gregor Sondermeier
Tags: jquery, slider, photography
Requires at least: 3.0
Tested up to: 4.2.2
Stable tag: trunk
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Displays a Slider / Carousel that is specialized for Images with variable Aspect Ratios.

== Description ==

Another jQuery Imageslider Plugin. The goal of this one though is to look pretty with images of different aspect ratios.

== Changelog ==

= 0.2 (2015-05-16) =
* renamed the existing mode from 'scrolling' to 'flow'
* introduced a new mode called 'step'
* these modes can either be specified in the options array when instantiating the plugin or as a data-attribute in the html markup
* created a GIT repository on bitbucket: https://bitbucket.org/GregorDeLaMuerte/vv-imageslider

= 0.1 (2015-05-02) =
* initial release
* added basic functionality for reading images, generating slides and widths and listening for hover- and click-events to offer a smooth scrolling behaviour

== Known Issues ==
* #1: filling the slideDimensions array in the imagesLoaded callback doesn't work reliable yet because auf the asynchronity