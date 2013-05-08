// Only if it's not already included
if (typeof ripestat != 'object') { 
    
    if (typeof STAT_WIDGET_API_URL != 'string')
        // Allow external specification of API location
        var STAT_WIDGET_API_URL = 'https://stat.ripe.net/widgets/';

    if (typeof STAT_DATA_API_URL != 'string')
        // Allow external specification of API location
        var STAT_DATA_API_URL = 'https://stat.ripe.net/data/';

    if (typeof STAT_OTHER_API_URL != 'string')
        // non-data API location
        var STAT_OTHER_API_URL = 'https://stat.ripe.net/api/';

    if (typeof STAT_HOME != 'string')
        // base target for link
        var STAT_HOME = "https://stat.ripe.net/";

    if (typeof STAT_DOM_CLASS_NAME != 'string')
        // DOM class for auto linking to div element
        var STAT_DOM_CLASS_NAME = 'statwdgtauto';

    if (typeof STAT_REQUIRE_TIMEOUT != 'number')
        // how many seconds to wait for scripts to load
        var STAT_REQUIRE_TIMEOUT = 7;
	
    document.write('<script src="' + STAT_WIDGET_API_URL + 'js/version.js' +
        '?nocache=' + Math.random() + '"></script>');
    
    document.write('<script src="js/widget_api_main.js"></script>');
    
}

