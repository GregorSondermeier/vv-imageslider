<?php

/**
 * Plugin Name: VV Imageslider
 * Description: Displays a Slider / Carousel that is specialized for Images with variable Aspect Ratios.
 * Version: 0.32
 * Author: Gregor Sondermeier
 * Author URI: https://github.com/DeLaMuerte, https://bitbucket.org/GregorDeLaMuerte
 * Network: true
 * License: GPL2
 *
 * Copyright 2015 Gregor Sondermeier  (email: invisiblekidgs@googlemail.com)
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License, version 2, as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 */

defined( 'ABSPATH' ) or die( 'No script kiddies please!' );

function addVVImagesliderStylesAndScripts() {
    wp_register_style('vvimageslider', plugins_url('css/vvimageslider.css', __FILE__));
    wp_enqueue_style('vvimageslider');

    wp_register_script('imagesloaded', plugins_url('js/libs/imagesloaded.pkgd.min.js', __FILE__));
    wp_register_script('vvimageslider', plugins_url('js/vvimageslider.js', __FILE__), array('jquery'), '0.31', false);
    wp_register_script('vvimageslider-run', plugins_url('js/vvimageslider.run.js', __FILE__), array('vvimageslider', 'imagesloaded'), '1.0', false);

    wp_enqueue_script('imagesloaded');
    wp_enqueue_script('vvimageslider');
    wp_enqueue_script('vvimageslider-run');
}

add_action( 'wp_enqueue_scripts', 'addVVImagesliderStylesAndScripts' );

?>