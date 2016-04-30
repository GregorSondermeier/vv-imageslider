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

= 0.6 (2016-04-30) =
* hide left/right trigger when on first/last slide
* unfocused images are being faded out
* added background color option
* added lightbox feature (with preloader spinner from http://preloaders.net/en/circular/water-ripples/)
* added jQuery Mobile v1.4.5 custom for touch event support

= 0.5 (2015-07-01) =
* added mobileheight option
* added support for window resize
* added mobilesuffix option for even smaller mobile pictures
* added mobilemaxheight option for setting the max height for which the mobile pictures and the mobile slider height
  should be used
* on mobile devices, the images in a slide are not clickable

= 0.4 (2015-06-27) =
* initial release that came out of VV Imageslider Obsolete

===========================================
========= VV Imageslider Obsolete =========
===========================================

= 0.32 (2015-05-26) =
* fixed bug that shows empty pages on nav change (was caused by jQuery mobile)
* fixed last pic bug (was caused by weird width calculation)

= 0.31 (2015-05-22) =
* fixed bug when trying to initialize the plugin when the element is not there

= 0.3 (2015-05-21) =
* optimized calculation of left rule of the ul: it is now being done on demand instead of on every image load
* generally made options given by data attributes stronger than options given within jQuery constructor
* height is now being set correctly for each image, too
* added basic mobile support: the triggers are not shown and the images change with swipe events
* added option "firstSlide"

= 0.2 (2015-05-16) =
* renamed the existing mode from 'scrolling' to 'flow'
* introduced a new mode called 'step'
* these modes can either be specified in the options array when instantiating the plugin or as a data-attribute in the html markup
* created a GIT repository on bitbucket: https://bitbucket.org/GregorDeLaMuerte/vv-imageslider

= 0.1 (2015-05-02) =
* initial release
* added basic functionality for reading images, generating slides and widths and listening for hover- and click-events to offer a smooth scrolling behaviour

== Known Issues ==
* [- #1: filling the slideDimensions array in the imagesLoaded callback doesn't work reliable yet because auf the asynchronity -] <- fixed in 0.3