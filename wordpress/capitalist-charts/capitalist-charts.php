<?php
/**
 * Plugin Name:       Capitalist Charts
 * Plugin URI:        https://capitalist.pk/widgets
 * Description:       Live Pakistan Stock Exchange widgets: tickers, quotes, charts, market maps, flows, funds and more. Shortcode: [capitalist widget="ticker-tape" symbols="PSX:KSE100,PSX:OGDC"]
 * Version:           1.0.0
 * Requires at least: 5.8
 * Requires PHP:      7.4
 * License:           Apache-2.0
 * License URI:       https://www.apache.org/licenses/LICENSE-2.0
 * Text Domain:       capitalist-charts
 */

if (!defined('ABSPATH')) {
	exit;
}

/** The exact loader this plugin version was released with, and its integrity hash (loader.php). */
function capitalist_charts_loader() {
	static $loader = null;
	if ($loader === null) {
		$loader = require __DIR__ . '/loader.php';
	}
	return $loader;
}

/**
 * The widgets and attributes the shortcode accepts. Generated from the widget catalog
 * (scripts/gen-docs.mjs), so nothing else can reach the page.
 */
function capitalist_charts_widgets() {
	static $widgets = null;
	if ($widgets === null) {
		$widgets = require __DIR__ . '/widgets.php';
	}
	return $widgets;
}

/** Loads the widget loader once per page, as an ES module. */
function capitalist_charts_enqueue() {
	static $done = false;
	if ($done) {
		return;
	}
	$done = true;
	$loader = capitalist_charts_loader();
	wp_enqueue_script('capitalist-charts-loader', $loader['url'], array(), null, array('in_footer' => true, 'strategy' => 'async'));
}

add_filter('script_loader_tag', function ($tag, $handle) {
	if ($handle !== 'capitalist-charts-loader') {
		return $tag;
	}
	$loader = capitalist_charts_loader();
	return str_replace('<script ', '<script type="module" integrity="' . esc_attr($loader['integrity']) . '" crossorigin="anonymous" ', $tag);
}, 10, 2);

/**
 * [capitalist widget="quote" symbol="PSX:OGDC" theme="auto"]
 * Optional content becomes the crawlable fallback inside the tag; by default a link to the
 * symbol's capitalist.pk page is written.
 */
function capitalist_charts_shortcode($atts, $content = null) {
	$atts = is_array($atts) ? $atts : array();
	$widget = isset($atts['widget']) ? strtolower(preg_replace('/[^a-z0-9-]/i', '', $atts['widget'])) : 'quote';
	$widgets = capitalist_charts_widgets();
	$tag = 'cap-' . $widget;
	if (!isset($widgets[$tag])) {
		return '';
	}
	$allowed = $widgets[$tag];
	$html = '';
	foreach ($atts as $name => $value) {
		$name = strtolower((string) $name);
		if ($name === 'widget' || !in_array($name, $allowed, true)) {
			continue;
		}
		$html .= ' ' . esc_attr($name) . '="' . esc_attr(substr((string) $value, 0, 400)) . '"';
	}
	$fallback = '';
	if ($content !== null && trim($content) !== '') {
		$fallback = wp_kses($content, array('a' => array('href' => true)));
	} else {
		$ref = isset($atts['symbol']) ? $atts['symbol'] : (isset($atts['symbols']) ? explode(',', $atts['symbols'])[0] : '');
		$symbol = strtoupper(trim(preg_replace('/^[A-Za-z-]+:/', '', (string) $ref)));
		if (preg_match('/^[A-Z0-9][A-Z0-9.-]{0,15}$/', $symbol)) {
			$fallback = '<a href="' . esc_url('https://capitalist.pk/psx/' . strtolower($symbol)) . '">' . esc_html($symbol . ' share price') . '</a>';
		} else {
			$fallback = '<a href="https://capitalist.pk/psx">' . esc_html__('Pakistan stock prices', 'capitalist-charts') . '</a>';
		}
	}
	capitalist_charts_enqueue();
	return '<' . $tag . $html . '>' . $fallback . '</' . $tag . '>';
}
add_shortcode('capitalist', 'capitalist_charts_shortcode');
