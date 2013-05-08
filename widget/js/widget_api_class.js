(function($) {
    
    require.config({
        urlArgs: "v=" + STAT_WIDGETS_VERSION,
        waitSeconds: STAT_REQUIRE_TIMEOUT,
        jQuery: $
    });

    var _WIDGETS = [];
    
    $(window).bind('hashchange', function(event) {
		var hash_state = getHashState();
        for (var i=0; i < _WIDGETS.length; i++) {
            var widget_id = _WIDGETS[i];
            var widget = $("#" + widget_id).statWidget();
            widget.update(getHashNamespace(widget_id, hash_state));
        }
    });

    function hash_length(hash) {
        var cnt = 0;
        for(var key in hash)
            cnt++;
        return cnt;
    }

    var SPEC_DEFAULTS = {
        title: 'No Title',
        apifunc: undefined, // same as slug
        mparam: [],
        oparam: [],
        jsfile: null,
        defaults: {},
    };

    // Takes an object and formats query string
    function uriEncode(base, data) {
        var qs = "";
        for (var key in data) {
            qs += qs.length ? '&' : '';
            qs += key;
            qs += "=" + encodeURIComponent(data[key]);
        }
        if(qs)
            return base + (base.indexOf('?') == -1 ? '?' : '&') + qs;
        
        return base;
    }

    ripestat = function () { // Wrapper static class
        
		WIDGET_SIZES = {
			micro: 160,
			mini: 256,
			small: 360,
			compact: 480,
			medium: 640,
			large: 1280
		}
        
        $.fn.statWidget = function() {
            return $(this).closest(".stat-widget").data("widget");
        }

        var RipestatClass = function (div, widget_name, params, styling) { // Ripestat manipulation class

            var w_main_div = $(div);
            var w_inner_div = null;
            var w_info_div = null;
            var w_data_div = null;
            var w_data_area_div = null;

			// this is a list of callbacks that get built up when the widget builds
			var w_data_url_callbacks = [];

            var w_widget_name = widget_name.toLowerCase();
            var w_params = (typeof params == 'undefined')?{}:params;
            var w_initial_params = null;
            var w_spec = null;
            var w_invalid_params = null;

            var w_data_params = null;
            var w_data = null;
            /* when the processing of the widget is done (successful or not) this is set to true */
            var w_loaded = false;

            var w_styling = (typeof styling != 'object')?{}:styling;
			var w_width = null;
            var w_disable_styling = ('disable' in w_styling)?w_styling.disable:[];
            
            // change all argurments to lower-case
            for (var i = 0; i < w_disable_styling.length; i++)
                w_disable_styling[i] = w_disable_styling[i].toLowerCase();
            
            /* controls are disabled by default unless it is explicitly set!!! */
            if (!(w_styling.show_controls && 
                typeof w_styling.show_controls == "string"  &&
                w_styling.show_controls.toLowerCase() == "yes"))
                w_disable_styling.push("controls");

            var _construct = function() {

                if (!(w_spec = _load_spec()))
                    return;

                // If the main div doesn't have an ID then we create one here
                var widget_id = w_main_div.attr("id");
                if (!widget_id) {
                    for (i=0; ; i++) {
                        widget_id = w_widget_name; 
                        if (i)
                            widget_id += "-" + i;
                        if (!$("#" + widget_id).length)
                            break;
                    }
                    w_main_div.attr("id", widget_id);
                }
                // Register this widget for onhashchange events
                _WIDGETS.push(widget_id);

                // Update the given parameters with the hash state
				var state_params = getHashNamespace(widget_id);
                if (state_params) {
                    for (var param in state_params) {
                        w_params[param] = state_params[param];
                    }
                }
                
                w_data_params = _get_data_params();

                _validate_params();

                if (w_invalid_params.length && !w_styling.show_controls) {
                    for (i=0; i < w_invalid_params.length; i++)
                        _req_error("Mandatory parameter <b>" +
                            w_invalid_params[i] + "</b> is missing.");
                    return;
                }

                w_initial_params = w_params;

                _build_scaffolding();       

            }   

            var _load_spec = function() {
                var orig = STAT_WIDGETS_SPEC[w_widget_name];
                if(! orig) {
                    _req_error("Widget name <b>" + w_widget_name + "</b> does not exist.");
                    return;
                }

                // check for required attributes
                if(! orig.pluginname) {
                    _req_error("Invalid widget spec: " + orig);
                    return;
                }

                if(orig.apifunc === undefined)
                    orig.apifunc = w_widget_name;

                return $.extend(true, {}, SPEC_DEFAULTS, orig);
            }

            var _get_data_params = function() {
                w_data_params = {};
                for (param in w_spec.defaults) {
                    w_data_params[param] = w_spec.defaults[param];
                }
                for (param in w_params) {
                    w_data_params[param] = w_params[param];
                }
                return w_data_params;
            }

			var _update_data_params = function(new_params) {
				w_data_params = new_params;
				for (var i=0; i < w_data_url_callbacks.length; i++)
					w_data_url_callbacks[i]();
			}

            var _validate_params = function () {
                w_invalid_params = [];
                for (var i=0; i< w_spec.mparam.length; i++) {
                    var par = w_spec.mparam[i];
                    if ( !(par in w_data_params) )
                        w_invalid_params.push(par);
                }
                return !w_invalid_params.length;
            }

            /*
             * Push state implied by 'new_params' to the URL hash, except 
             * for default parameters
             * */
            var _push_state = function(new_params) {
                var state = {};
                for (var param in new_params)
                    if (new_params[param] != w_spec.defaults[param])
                        state[param] = new_params[param];
				updateHashNamespace(w_main_div.attr("id"), state);
            }
            
            /**
             * Returns the url used to connect to the data API.
             * 
             * XSS safe
             */
            var _get_data_url = function (data_type, apifunc, url_params, validate) {
                if (!data_type)
                    data_type = "json";
				if (!apifunc)
					apifunc = w_spec.apifunc;
				if (!url_params)
					url_params = w_data_params;
				if (typeof validate == "undefined")
					validate = true;
				else
					validate = false;

                if (!apifunc)
                    return;

                var basic_url = STAT_DATA_API_URL + apifunc + '/data.' + data_type;

                var necessary_url_params = {};
                for (var p in url_params) {
                    if (!validate || $.inArray(p, w_spec.mparam)>-1 || $.inArray(p, w_spec.oparam)>-1 ){
                        necessary_url_params[p] = decodeURIComponent(url_params[p]);
                    }
                }
                
                data_api_url = jQuery.param.querystring(basic_url, necessary_url_params);
                
                return data_api_url;
            }

            var _get_methodology_url = function() {
                return STAT_DATA_API_URL + 'widget-documentation/data.json?widget_name=' + w_spec.apifunc;
            }

            var _build_scaffolding = function () {
                _build_naked();
                _apply_sizing();
                
                /* check if the container provides enough space to render the widget */                
                var enoughSpace = true;
                if (w_main_div.width && w_spec.minwidth)
                    enoughSpace = w_main_div.width() >= w_spec.minwidth;

                if ($.inArray('container', w_disable_styling) != -1) {
                    w_main_div.addClass('naked-box');
                } else {
                    w_main_div.addClass('full-box');
                    
                    if (enoughSpace)
                        if ($.inArray('footer-buttons', w_disable_styling) ==-1)
                            _add_buttons();
                }
                
                /* title and RIPEstat logo will always be rendered */                
                if ($.inArray('title', w_disable_styling) ==-1)
                    _add_title();
                if ($.inArray('logo', w_disable_styling) ==-1)
                    _add_logo();
                    
                if (enoughSpace) {
                    if ($.inArray('theme', w_disable_styling) == -1)
                        w_main_div.addClass('stat-theme');
                    if ($.inArray('controls', w_disable_styling) == -1)
                        _add_controls();
                    if (w_width>450 && $.inArray('feedback', w_disable_styling) ==-1)
                        _add_user_feedback();
                } else {
                    var minWidthToDisplay = w_spec.minwidth;
                    var text = "<ul class='messages'>" +
                                   "  <li class='warning'>The minimum width for this widget to be rendered correctly is " + minWidthToDisplay + "px!<br>" +
                                   "                      <a href='https://stat.ripe.net/feedback' target='_blank'>Your RIPEstat team</a>" +
                                   "  </li>" +
                                   "</ul>";
                    $(w_main_div).append(text);
                    w_invalid_params.push("Not enough space to render widget!"); /* this also prevents the loading of data */
                }
                
            }

            var _permalink = function(link_params) {
                if (link_params == undefined) {
                    link_params = w_params;
                }

                var _params = {};
                for (var key in link_params) {
                    _params["w." + key] = link_params[key];
                }
                    
                var url = STAT_HOME + 'widget/' + w_widget_name;
                
                return $.param.fragment(url, _params);
            }

			var _apply_sizing = function() {
				if (w_styling.size == "fit") {
					w_width = Math.max(0, w_main_div.parent().width());
				} else {
					w_width = WIDGET_SIZES[w_styling.size];
					
					if (!w_width && parseInt(w_styling.size))
					   w_width = parseInt(w_styling.size); 
				}

				if (!w_width)
					w_width = WIDGET_SIZES.medium;

                w_main_div.css('width', w_width);
			}

            var _build_naked = function() {
                w_main_div.empty();
                w_main_div.addClass('stat-widget');
                w_main_div.css('position','relative');
                
                w_inner_div = $('<div class="inner-div">');
                $('<div class="box-content">').appendTo(w_main_div)
                                              .append($("<div class='controlls-container'>"))
                                              .append(w_inner_div);
            }
            
            /**
             * Creates and adds the title to the widget.
             * 
             */
            var _add_title = function () {
                var title_txt = w_spec.title;
                if ( ($.inArray('resource', w_spec.mparam)!=-1 || $.inArray('resource', w_spec.oparam)!=-1) && 'resource' in w_params && w_params.resource != "") {
                    title_txt += ' (' + decodeURIComponent(w_params.resource) + ')';
                }
                var title_el = $('<h2>').append(
                                            $('<a href="' + _permalink()  + '" class="widget-title">').text(title_txt)
                                        );	
                
                // Add top pad to avoid overlap with logo
                if (w_width<360 && !(('disable' in w_styling) && (w_styling.disable.indexOf('logo') > -1)))
                	title_el.css('padding-top', '8px');
                
                $('.box-content', w_main_div).prepend(title_el);
            }

            var _add_controls = function() {
				var _add_resource_box = $.inArray("resource", w_spec.mparam) !=
					-1 || $.inArray("resource", w_spec.oparam) != -1;
				if (!_add_resource_box)
					return;  // this is the only control at the moment
                var _initial = "Reload this widget by entering a resource here";
                if (w_styling.resource_input_text && typeof w_styling.resource_input_text == 'string' ) 
                    _initial = w_styling.resource_input_text
                    
                var _controls = $("<form><fieldset class=controls><input type=text class='widget-resource-input' value='" + _initial + "'><button type=submit></fieldset></form>");
                _controls.find("button").css("background", "url(" + STAT_WIDGET_API_URL + "lib/img/bgplay/search_button.png?v=1) repeat scroll 0 0 transparent");

                _controls.submit(function() {
                    var _val = $(this).find("input").val();
                    if (_val && _val != _initial) {
                        var _widget = $(this).statWidget();
                        var _params = _widget.get_params();
                        _params.resource = _val;
                        _widget.navigate(_params);
                    }
                    return false;
                });

                var _input = _controls.find("input");
                _input.css("color", "grey");
                _input.focusin(function() {
                    if ($(this).val() == _initial) {
                        $(this).val("");
                        $(this).css("color", "black");
                    }
                });
                _input.focusout(function() {
                    if (!$(this).val()) {
                        $(this).val(_initial);
                        $(this).css("color", "grey");
                    }
                });
                $(".controlls-container", w_main_div).append(_controls);
            }

            var _add_logo = function () {
                $('<a>')
                    .attr('href', STAT_HOME)
                    .css({'position':'absolute','top':'9px','left':'7px'})
                    .html('<img src="' + STAT_WIDGET_API_URL + 'lib/img/bgplay/logo-small.png" class="widget-ripestat-logo" title="RIPEStat" alt="logo">')
                    .prependTo(w_main_div);

                if ('marknew' in w_spec && w_spec.marknew) {
                    $('<img title="RIPEStat" alt="logo">')
                        .css({'position':'absolute','top':'5px','right':'5px'})
                        .attr('src', STAT_WIDGET_API_URL + 'lib/img/bgplay/new-icon.png')
                        .prependTo(w_main_div);
                }
            }
            
            var fb_lnk;
            var _add_user_feedback = function() {
            	
            	fb_lnk = $('<img src="' + STAT_WIDGET_API_URL + 'lib/img/bgplay/feedback-icon-small.png" title="Tell us what you think about this RIPEstat widget">').css({
            		position: 'absolute',
            		top: 4,
            		right: 5,
            		width: 34,
            		height: 34,
            		cursor: 'pointer'
            	}).hide();
            	
            	require([ STAT_WIDGET_API_URL + "js/user_feedback.js" ], function(fb) {
            		var fb_form = fb.add_widget_feedback_form($('.box-content', w_main_div), w_widget_name, ('resource' in w_params)?w_params.resource:null);
            	
            		fb_lnk
	            		.click(function() {
	            			$(this).attr("src",STAT_WIDGET_API_URL + 'lib/img/bgplay/feedback-icon.png');
	            			fb_form.dialog("open");
	            		})
	            		.hover(
	            			function() {
	            				$(this).attr("src", STAT_WIDGET_API_URL + 'lib/img/bgplay/feedback-icon-rev-small.png');
	        				}, 
	        				function() {
	        					$(this).attr("src",STAT_WIDGET_API_URL + 'lib/img/bgplay/feedback-icon-small.png');
	        				}
	        			);
            		
            		$('.box-content', w_main_div).prepend(fb_lnk);
            	});
            }

            var _add_data_div = function (left_ul, footer_div) {
				if (!w_data_area_div)
					w_data_area_div = $('<div><h3>Data used in this widget</h3></div>');
				else
					w_data_area_div.empty();

                if (!w_data_div)
					w_data_div = $('<textarea readonly rows=10 style="width:95%; resize: none;font-size: 90%">');
				w_data_div.appendTo(w_data_area_div);
                
                left_ul.append(
                    $("<li>").append($('<a class="button" href="' + _get_data_url("json") +'">source data</a>').trigger_area_toggle('dataview', 3))
                );

                var data_popup_div = $('<div>').addClass('dataview popup').appendTo(footer_div).hide();

                if ($.inArray('data-download', w_disable_styling) ==-1) {
                    data_popup_div.append(
                        '<h3>Sample data API call</h3>',
                        '<input style="width:95%" value="' + _get_data_url('json') + '">',
                        '<br><br>',
                        'Download as: ',
                        '<a href="' + _get_data_url('json') + '" target="_blank">json</a>',
                        ' | <a href="' + _get_data_url('yaml') + '" target="_blank">yaml</a>',
                        '<br><br>'
                    );
                }

				w_data_url_callbacks.push(function() {
					data_popup_div.find("input").attr("value",
						_get_data_url("json"));
					var anchors = data_popup_div.find("a");
					anchors.first().attr("href", _get_data_url("json"));
					anchors.last().attr("href", _get_data_url("yaml"));
				});

                data_popup_div.append(w_data_area_div.hide());
            };

            var _add_buttons = function () {

            	var smallSize = (w_width<=230); // Size too small to have all buttons
            	
                var footer_div = $('<div>').addClass('box-buttons').appendTo(w_main_div);

                var left_ul = $('<ul>').addClass('left').css('margin-left', '0').appendTo(footer_div);
                var right_ul = $('<ul>').addClass('right').appendTo(footer_div);

                var first_button=true;
                if (!smallSize && $.inArray('data', w_disable_styling) == -1 && _get_data_url('json')) {
                    _add_data_div(left_ul, footer_div);
                }

                if ($.inArray('embed-code', w_disable_styling) ==-1) {
                    right_ul.append(
                        $("<li>").append($('<a class="embed-code-link button" href="javascript: void(0);">embed code</a>').trigger_area_toggle('embed_code', 3))
                    );
                    first_button=false;

                    $('<div>').addClass('embed_code popup').append(
                        '<h3>Embed this widget on your page</h3>',
                        _get_embed_code()
                    ).appendTo(footer_div).hide();
                }

                if ($.inArray('permalink', w_disable_styling) ==-1) {
                    right_ul.append(
                        $("<li>").append($('<a class="permalink-popup-link button" href="' + _permalink() + '">permalink</a>').trigger_area_toggle('permalink', 3))
                    );
                    first_button=false;

                    $('<div>').addClass('permalink popup').append(
                        '<h3>Permalink</h3>',
                        '<input style="width:85%" value="' + _permalink() + '">',
                        '<a href="' + _permalink() + '">open</a>'
                    ).appendTo(footer_div).hide();
                }

                if (!smallSize && $.inArray('info', w_disable_styling) ==-1) {

                    w_info_div = $('<div class="widget-documentation">');
                    
                    var toggleLink = $('<a class="info-popup-link button" href="javascript:void(0);">').html("info");
                    /* Load info/methodology only on demand */
                    toggleLink.click(function () {
                        if (!toggleLink.hasClass("loaded")) {
                            
                            var loading_splash = "<center><img src='" + STAT_WIDGET_API_URL + "lib/img/bgplay/ajax-loader.gif'><br>" +
                                                 "<span>Loading content documentation...</span></center>"; 
                            w_info_div.html(loading_splash);
                            
                            $.jsonp({
                                url: _get_methodology_url(),
                                callbackParameter: "callback",
                                cache: true,
                                error: function (xOptions, textStatus) {
                                    w_info_div.text('Loading methodology failed.');
                                    _handle_ajax_error(xOptions, textStatus);
                                },
                                success: function (response) {
                                    w_info_div.html(response.data.documentation);
                                }
                            });
                            toggleLink.addClass("loaded");
                        }
                    });
                                                      
                    right_ul.append(
                        $("<li>").append(toggleLink.trigger_area_toggle('methodology', 3))
                    );
                    first_button=false;
                    
                    $('<div>').addClass('methodology popup').append(
                        '<h3>Content Explanation</h3>',
                        w_info_div
                    ).appendTo(footer_div).hide();
                }
            };

            var _fill_widget = function(callback) {
                
                /*
                 * Make sure all widget code is executed with the same JQuery version
                 */                
                var preservedJQuery = jQuery;
                var preservedJQueryShort = $;
                jQuery = ripestat.jQuery;
                $ = jQuery;
                
                var sources = [];
                if(w_spec.jsfile) {
                    sources.push("js/" + w_spec.jsfile +
                        "?widget_api=" + STAT_WIDGETS_VERSION);
                }
                
                
                
                require(sources, function() {
                    _catch_errors(function () {
                        w_inner_div.empty();
                        
                        var mark_loaded = function () {
                            w_loaded = true;
                        }
                        
                        var pluginObj = w_inner_div[w_spec.pluginname](w_data, w_width, mark_loaded);
                        
                        /* if the widget needs to set the "loaded" property individually  */
                        if (!(pluginObj && pluginObj["markLoadedCallback"])) {
                            mark_loaded();
                        }

                        if (typeof callback == 'function')
                            callback();
                    });
                    
                    /*
                     * Return to the global JQuery version
                     */
                    jQuery = preservedJQuery;
                    $ = preservedJQueryShort;
                });
                
                
            };

            var _get_embed_code = function () {

                var script_incs = '&lt;script src="' + STAT_WIDGET_API_URL + 'widget_api.js"&gt;&lt;/script&gt;';
                
                var embed_styling = $.extend(true, {}, w_styling);
                if ('disable' in embed_styling) {
                	for (var i in embed_styling.disable) { // Never include logo disabling in the displayed embed code
                		if (embed_styling.disable[i] == 'logo') { 
                			embed_styling.disable.splice(i,1);
                			break;
                		}
                	}
                }
                

                var js_code = 'ripestat.init('
                    + '"' + w_widget_name + '"'
                    + ((hash_length(w_params) == 0)?',{}':',' + JSON.stringify(w_params))
                    + ',null'
                    + ((hash_length(embed_styling) == 0) ? '' : ',' + JSON.stringify(embed_styling))  
+ ')';

var embed_code =
'<textarea readonly rows=3 style="width:95%; height: auto; resize: none;font-size: 90%; padding: 5px;">' 
+ script_incs + '\n'
+ '&lt;div class="' + STAT_DOM_CLASS_NAME + '"&gt;'
+ '&lt;script&gt;' + js_code + '&lt;/script&gt;'
+ '&lt;/div&gt;'
+ '</textarea> <br>'
+ 'Copy and paste this code into an HTML webpage. Note: <i>widget_api.js</i> (the 1st line) only needs to be included once per page.'
+ '<br><br>'
+ 'For more usage details please view the RIPEstat Widget API <a href="http://stat.ripe.net/docs/widget_api/">documentation</a>.';

return embed_code;
            }

            var _req_error = function (descr) {
                w_main_div.html("<b>Request Error</b>: " + descr);
            };
           
            // log, show the user, and report to the server
            // expects a standard Error object with MDN extensions.
            var _report = function(err) {
                
                var data = {
                    level: err.level || "error",
                    message: err.toString(),
                    file: err.fileName || err.sourceURL,
                    line: err.lineNumber || err.line,
                    stack: err.stack,
                    widget: w_widget_name,
                    params: w_params
                };
                
                $('.box-content', w_main_div).addMsg(data.level, err.toString());

                if(window.console)
                    console.error('reporting ', err.toString(), data);

                $.jsonp({
                    url: STAT_OTHER_API_URL + 'report',
                    callbackParameter: "callback",
                    data: data
                });
            };

            var _catch_errors = function(fun) {
                // define ?THROW_ERRORS to aid debugging in IE
                if(location.href.indexOf('THROW_ERRORS') != -1) {
                    fun();
                    return;
                }

                try {
                    fun();
                } catch(err) {
                    w_loaded = true;
                    _report(err);
                }
            };

            // construct an error object from a failed JSON-P call and report on it
            var _handle_ajax_error = function(xOptions, textStatus) {
                var err = Error('Error loading ' + xOptions.url);

                if(textStatus != "error")
                    err.message += " (" + textStatus + ")";

                err.fileName = xOptions.url;

                _report(err);
            };

            /*
             * This function takes care of the div showing the loaded data in plain form.
             */
			var _update_data_div = function() {
				if (w_data && w_data_div) {
					w_data_div.val(JSON.stringify(w_data, null, 4));
					w_data_area_div.show();
				}
			}

			var _get_data = function(apifunc, params, success, error) {
				var url = _get_data_url("json", apifunc, params, false);
				
				// multi-origin request, so we use JSONP instead of JSON
				$.jsonp({
					url: url,
					callbackParameter: "callback",
					cache: true,
					error: function (xOptions, textStatus) {
						_handle_ajax_error(xOptions, textStatus);
						if (error)
							error(textStatus);
					},
					success: function (json) {
						_catch_errors(function () {
						    
						    require([ STAT_WIDGET_API_URL + "js/misc.js" ], function(misc) {
    							// add messages
    							var existing = [];
    							$(".box-content ul.messages li", w_main_div).each(
    								function(i, msg_el) {
    									var el = $(msg_el);
    									existing.push(el.text());
    								}
    							);
    							$.each(json.messages, function (_i, msg) { 
    								if ($.inArray(msg[1], existing) == -1) 
    									$('.box-content', w_main_div).addMsg(msg[0], msg[1]);
    							});
    
    							// add see-also resources
    							if(json.see_also.length > 0) {
    								var also = $('<ul>');
    								$.each(json.see_also, function(_i, see) {
    									$('<li>')
    									.text(' (' + see.relation + ')')
    									.prepend(misc.stat_link(see.resource))
    									.appendTo(also);
    								});
    
    								$('<div><h3>See Also:</h3>')
    								.append(also)
    								.appendTo($('.box-content', w_main_div))
    								.collapsable({state: "on"})
    								;
    							}
							});

						});

                        /*
                         * In case the data call is not successful the API will return a status code 
                         * different from 200.
                         */
						if (json.status_code == 200) {
						    if (json.status != "maintenance") {
    							success(json.data);
						    } else {
						        w_inner_div.empty();
						    }
						} else {
							error(json.data);
						}
					}
				});
			}

            var _load_data = function(callback) {
                
                /*
                 * Make sure all widget code is executed with the same JQuery version
                 */
                preservedJQuery = jQuery;
                preservedJQueryShort = $;
                jQuery = ripestat.jQuery;
                $ = jQuery;
                
                require([ STAT_WIDGET_API_URL + "js/misc.js" ], function(misc) {

                    w_inner_div.html('<div class="center"><img class="ajax_loader_image" src="' + STAT_WIDGET_API_URL + 'lib/img/bgplay/ajax-loader' + (w_width<=WIDGET_SIZES.micro?"-small":"") + '.gif" title="Data is loading" alt="loading image"></div>');
                    
					_get_data(null, null, function(response_data) {
						w_data = response_data;
						w_inner_div.empty();
						_update_data_div();

						callback();
					}, function(error_status) {
						w_inner_div.empty();
						w_loaded = true;
					});
                });
                /*
                 * Return to the global JQuery version
                 */        
                jQuery = preservedJQuery;
                $ = preservedJQueryShort;
            };

            _construct();

            return {

                load : function(callback) {   
                    function after_load() {
                        _catch_errors(function () {
                            _fill_widget(callback);
                        });
                    }

                    if(_get_data_url('json')) {
                        _load_data(after_load);
                    } else {
                        after_load();
                    }
                    
                    if (fb_lnk) {
                        $(fb_lnk).show();
                        // TODO:
                        // only load when data is loaded / not when widget is in preload state
                        // also only load if a certain width and height is available - check that
                    }
                },

                get_title : function() {
                    return w_spec['title'];
                },

				get_name : function() {
					return w_widget_name;
				},

                get_param : function(param_name) {
                    if (param_name in w_params)
                        return w_params[param_name];
                    return null;
                },

                get_params : function() {
                    return $.extend({}, w_params);
                },

                get_data_uri : function(data_type) {
                    return _get_data_url(data_type);
                },

                get_data : function() {
                    return w_data;
                },

				get_data_params : function() {
					return w_data_params;
				},
                
                get_styling: function (){
                    return $.extend({}, w_styling);
                },

                reset : function() {
                    w_loaded = false;
                    w_inner_div.empty();
					w_data_url_callbacks = [];
                    w_data = null;
                    if(w_data_div)
                        w_data_div.empty();
                    if(w_data_area_div)
                        w_data_area_div.hide();   
                },

                reload : function(callback) {
                    this.reset();
                    this.load(callback);
                },

                navigate : function(new_params) {
                    _push_state(new_params);
                },

                update : function(new_params, callback) {
                    // ToDo: On v2 this needs to be reviewed to allow the widget to update itself with new params without reloading
                    if (!new_params)
                        new_params = w_initial_params;

                    var diffs = false;
                    var all_params = $.extend({}, w_params, new_params);
                    for (var param in all_params)
                        if (new_params[param] != w_params[param]) {
                            diffs = true;
                            break;
                        }
                    if (!diffs)
                        return;

                    this.reset();
                    w_params = new_params;

                    w_data_params = _get_data_params();

                    _validate_params();
                    if (!w_invalid_params.length) {
                        _build_scaffolding();       
                        this.load(callback);
                    }
                },

                get_permalink : function(link_params) {
                    return _permalink(link_params);
                },

                get_invalid_params : function() {
                    return w_invalid_params;
                },
                
                /*
                 * This method might be handy to get the available width
                 */
                get_main_div: function () {
                    return w_main_div;
                },

				get_new_data: function(apifunc, params, callback) {
					return _get_data(apifunc, params, callback);
				},

				update_data: function(new_data) {
					w_data = new_data;
					
					/*
					 * Just in case this function triggers an AJAX loader image and 
					 * doesn't take care to remove it on a high level.
					 */
					if (!w_data && w_info_div) {
					    var ajaxLoaderImg = w_info_div.find("img");
					    if (ajaxLoaderImg)
					       ajaxLoaderImg.attr("src", "lib/img/bgplay/ajax-loader-error.png");
                    }
					
					_update_data_div();
				},

				update_data_params: function(new_params) {
					_update_data_params(new_params);
				},
				
				is_loaded: function () {
				    return w_loaded;
				}

            }
        } /// End of RipestatClass
        
        return {

			WIDGET_SIZES: WIDGET_SIZES,

            list_widgets : function() {
                var wlist = [];
                for (var w in STAT_WIDGETS_SPEC) {
                    if(w[0] != '_') // ignore private widgets
                        wlist.push(w);
                }
                return wlist.sort();
            },

            preload : function (widget_name, params, selector, styling) {

                var div;
                if (typeof selector == "string" && $.trim(selector)) {
                    // If an ID was specified
                    div = $("#" + selector).first();
                } else if (typeof selector == "object" && selector) {
                    div = selector.first();
                } else {
                    // If it is based on the "magic" class name
                    div = $('.' + STAT_DOM_CLASS_NAME).first().removeClass(STAT_DOM_CLASS_NAME);
                }

                if(div.length < 1) {
                    console.error("no element found to place widget");
                    return null;
                }

                widget_obj = RipestatClass(div, widget_name, params, styling);
                div.data("widget", widget_obj);
                return widget_obj;
            },

            init : function(widget_name, params, selector, styling, callback) {
                var widget = this.preload(widget_name, params, selector, styling);
                if(!widget.get_invalid_params().length)
                    widget.load(callback);
                return widget;
            },
            
            jQuery: $
        };
    }();

})(jQuery);
