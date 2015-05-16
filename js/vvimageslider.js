/**
 * jQuery VV Imageslider
 *
 * Displays a Slider / Carousel that is specialized for Images with variable Aspect Ratios.
 *
 * @version: 0.1 (2015-05-02)
 * @author: Gregor Sondermeier (https://github.com/DeLaMuerte)
 * @license: GPL2
 *
 * @todo:
 * - write documentation
 * - implement looping option
 * - scroll per image
 * - separate scrolling Intervals for hovering and clicking so that mouseup event doesn't stop the scrolling because the user is still on mouseover
 * - use CSS animation instead of JS intervalls, duh!
 */
(function ($) {

    $.fn.VVImageslider = function(useroptions) {

        /**
         * options defintion
         */
        var defaultoptions = {
            height: 700,
            margin: 15,
            mode: 'flow',        // 'flow' || 'step'
            intervalTime: 40,
            baseFlowSpeed: 1,
            hoverSpeedMultiplier: 4,
            clickSpeedMultiplier: 32
        };
        var options = $.extend(defaultoptions, useroptions);

        /**
         * the elements that are needed again and again
         */
        var self = this;
        var ul = self.find('ul');
        var imgs = self.find('img');
        var imgcount = imgs.length;

        /**
         * Styling variables
         */
        var containerWidth = self.width();
        var lastImgWidth = 0;
        var totalWidth = 0;

        var flowInterval;

        /**
         * start this thing
         */
        initStyling();
        addTriggers();
        setTotalWidth();


        if (options.mode == 'flow') {
            setFlowListener();
        } else if (options.mode == 'step') {
            setStepListener();
        }


        /**
         * read the options and set the chosen dimensions and possibly do other stuff
         */
        function initStyling() {
            self.height(options.height);
            self.find('li:not(:last-child)').css({'margin-right': options.margin + 'px'});
        };

        /**
         * add the triggers to be able to scroll through the content
         */
        function addTriggers() {
            self.append('<div class="vv-imageslider-trigger vv-imageslider-trigger-left"><span class="vv-imageslider-trigger-icon">&lt;</span></div>');
            self.append('<div class="vv-imageslider-trigger vv-imageslider-trigger-right"><span class="vv-imageslider-trigger-icon">&gt;</span></div>');
        };

        /**
         * count all images and set the width for the parent ul container
         */
        function setTotalWidth() {
            imgs.each(function(i, img) {
                imagesLoaded(img, function() {
                    var itemWidth = $(img).parents('li.vv-imageslider-slide').outerWidth(true);
                    lastImgWidth = itemWidth;
                    totalWidth += itemWidth;
                    ul.width(totalWidth);
                });
            });
        };

        /**
         * add the listener to scroll through the DOM elements in flow mode
         */
        function setFlowListener() {
            self.find('.vv-imageslider-trigger-left').mouseenter(function() {
                startFlow('right', options.hoverSpeedMultiplier);
            });
            self.find('.vv-imageslider-trigger-right').mouseenter(function() {
                startFlow('left', options.hoverSpeedMultiplier);
            });
            self.find('.vv-imageslider-trigger-left').mousedown(function() {
                startFlow('right', options.clickSpeedMultiplier);
            });
            self.find('.vv-imageslider-trigger-right').mousedown(function() {
                startFlow('left', options.clickSpeedMultiplier);
            });

            self.find('.vv-imageslider-trigger').bind('mouseleave mouseup', stopFlow);
        };

        /**
         * ignites the flow interval. makes the ul move.
         *
         * @param   {String}    direction       'left' or 'right'
         * @param   {int}       multiplier      determines the flow speed
         */
        function startFlow(direction, multiplier) {
            var newLeft;
            stopFlow();
            flowInterval = setInterval(function() {
                switch (direction) {
                    case 'left':
                        newLeft = ul.position().left - options.baseFlowSpeed * multiplier;
                        break;
                    case 'right':
                        newLeft = ul.position().left + options.baseFlowSpeed * multiplier;
                        break;
                    default:
                        break;
                }

                // left border
                if (totalWidth + newLeft >= totalWidth) {
                    newLeft = 0;
                }
                // right border
                if (totalWidth - containerWidth + newLeft <= 0) {
                    newLeft = containerWidth - totalWidth;
                }
                ul.css({left: newLeft});
            }, options.intervalTime);
        };

        /**
         * stops the flow interval
         */
        function stopFlow() {
            if (flowInterval) {
                clearInterval(flowInterval);
            }
        };

        /**
         * add the listener to scroll through the DOM elements in step mode
         */
        function setStepListener() {

        };
    };

}(jQuery));