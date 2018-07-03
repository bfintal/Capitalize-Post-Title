<?php
/**
 * Main plugin file
 *
 * @package Capitalize Post Title
 */

/**
Plugin Name: Capitalize Post Title
Plugin URI: https://wordpress.org/plugins/capitalize-post-title
Description: Properly capitalize your English post & page titles after you type it.
Author: Benjamin Intal, Gambit
Version: 0.1
Author URI: http://gambit.ph
 */

if ( ! defined( 'ABSPATH' ) ) { exit; // Exit if accessed directly.
}

add_action( 'admin_enqueue_scripts', 'capitalize_title_admin_head' );
function capitalize_title_admin_head() {
    wp_enqueue_script( 'capitalize-title', plugins_url( 'dist/script.js', __FILE__ ) );
}