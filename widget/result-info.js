define([
    STAT_WIDGET_API_URL + "js/misc.js",
    ], function(misc) {

        var $ = jQuery;

        $.fn.resultInfoIPv6LD = function(data, widget_width) {
            var widgetId = "resultInfoIPv6LD-" + (new Date().getTime());
            
            var box = $(this).closest(".stat-widget").find(".box-buttons").hide()
                             .end().find(".widget-title").hide()
                             .end().find(".widget-ripestat-logo").hide();
            
            var infoText = "This result page shows a selection of more information available for this prefix!" +
                           "<br>" +
                           "Please visit "+misc.stat_link(data.resource)+" to get the full information."; 
            this.addMsg('info', infoText);
            
            return this;
        };
    });
