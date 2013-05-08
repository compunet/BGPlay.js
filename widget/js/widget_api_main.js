function stat_get_url(path) {
    return STAT_WIDGET_API_URL + path + '?widget_api=' + STAT_WIDGETS_VERSION;
}

function stat_load_script(path) {
    document.write('<script src="' + stat_get_url(path) + '"></script>');
}

function stat_load_css(path) {
    document.write('<link type="text/css" rel="stylesheet" type="text/css" ' +
        'href="' + stat_get_url(path) + '" />');
}

stat_load_script('lib/js/require-min.js');

if (typeof jQuery == 'undefined') {
    document.write('<script src="' + STAT_WIDGET_API_URL + 'lib/js/jquery/jquery-1.6.2.min.js"></script>');
    //document.write('<script>jQuery.noConflict();</script>');
}

if (typeof jQuery == 'undefined' || typeof jQuery.ui == 'undefined') {
	//document.write('<script src="' + STAT_WIDGET_API_URL + 'lib/js/jquery/jquery-ui-1.8.20.custom.min.js"></script>');
	document.write('<script src="' + STAT_WIDGET_API_URL + 'lib/js/jquery/jquery-ui-1.9.1/jquery-ui-1.9.1.custom.min.js"></script>');
}
//stat_load_css("lib/css/jquery-ui-1.8.20.custom.css");
stat_load_css("lib/css/jquery-ui-1.9.1/stat-widget/jquery-ui-1.9.1.custom.css");


document.write('<script src="' + STAT_WIDGET_API_URL + 'lib/js/jquery/jquery.jsonp-2.2.1.js"></script>');
if (!document.createElement('canvas').getContext) {
    stat_load_script('lib/js/excanvas.js');
}
stat_load_script('js/jquery.ba-bbq.min.js');
stat_load_script("js/hash-state.js");
stat_load_script('lib/js/json2.js');
stat_load_script('js/misc_jquery.js');
document.write('<script src="js/widget_api_class.js"></script>');
document.write('<script src="js/widget_specs.js"></script>');

stat_load_css('widgets-main.css');


