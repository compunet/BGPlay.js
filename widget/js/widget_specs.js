/* For each widget_name:
    title - Name of the widget to display
    apifunc - Data API function name
    mparam - Mandatory API parameters
    oparam - Optional API parameters
    jsfile - which js file to load dynamically (that contains the jquery plugin for this widget)
    pluginname - name of the jquery plugin that builds the content for this widget
    marknew - If existing and =true, will add a "New" watermark to the widget, together with the logo
*/
var STAT_WIDGETS_SPEC = {

    'bgplay' : {
        title: 'BGPlay',
        apifunc: 'bgplay',
        mparam: ['resource'],
        oparam: ['max_related'],
        jsfile: 'resource-overview.js',
        pluginname: 'statBGPlay',
        defaults: {
            unix_timestamps:"TRUE",
            starttime:1354701000,
            endtime:1354702000,
            resource:"122.161.0.0/16",
            instant:null,//"id,timestamp"
            ignoreReannouncements:false,
            type:"bgp",
            paramsInUrl:false,
            preventNewQueries:false,
            nodePositions:null
        },
        minwidth: 256
    },
    
    'anti-abuse-contact' : {
        title: 'Anti-Abuse Contact',
        apifunc: 'anti-abuse-contact',
        mparam: ['resource'],
        oparam: [],
        jsfile: 'anti-abuse-contact.js',
        pluginname: 'antiAbuseContact',
        minwidth: 160
    },

    'address-space-hierarchy': {
        title: 'Address Space Hierarchy',
        apifunc: 'address-space-hierarchy',
        mparam: ['resource'],
        oparam: ['get_org_names', 'rir', 'aggr_levels_below'],
        jsfile: 'address-space-hierarchy.js',
        pluginname: 'statAddressSpaceHierarchy',
        defaults: {
            get_org_names: true,
			aggr_levels_below: 7
        },
        minwidth: 256
    },
    
    'address-space-usage' : {
        title: 'Address Space Usage',
        apifunc: 'address-space-usage',
        mparam: ['resource'],
        oparam: [],
        jsfile: 'address-space-usage.js',
        pluginname: 'addressSpaceUsage',
        minwidth: 160
    },
    
    'allocation-history': {
        title: 'Allocation History',
        apifunc: 'allocation-history',
        mparam: ['resource'],
        oparam: ['starttime', 'endtime'],
        jsfile: 'allocation-history.js',
        pluginname: 'allocationHistory',
        minwidth: 256
    },
    
    'announced-prefixes': {
        title: 'Announced Prefixes',
        apifunc: 'announced-prefixes',
        mparam: ['resource'],
        oparam: ['starttime', 'endtime'],
        jsfile: 'announced-prefixes.js',
        pluginname: 'statAnnouncedPrefixes',
        minwidth: 256
    },
    
    'as-overview': {
        title: 'Resource Overview',
        apifunc: 'as-overview',
        mparam: ['resource'],
        oparam: [],
        jsfile: 'resource-overview.js',
        pluginname: 'statAsOverview',
        minwidth: 160
    },
    
    'as-path-length': {
        title: 'AS Path Length',
        apifunc: 'as-path-length',
        mparam: ['resource'],
        oparam: ['sort_by'],
        defaults: {
            sort_by: "geo"
        },
        jsfile: 'as-path-length.js',
        pluginname: 'statAsPathLength',
        minwidth: 160
    },

    'as-routing-consistency': {
        title: 'AS Routing Consistency',
        apifunc: 'as-routing-consistency',
        mparam: ['resource'],
        jsfile: 'as-routing-consistency.js',
        pluginname: 'asRoutingConsistency',
        minwidth: 245
    },
    
    'asn-neighbours': {
        title: 'ASN Neighbours',
        apifunc: 'asn-neighbours',
        mparam: ['resource'],
        oparam: [],
        jsfile: 'asn-neighbours.js',
        pluginname: 'asnNeighbours',
        minwidth: 250
    },
    
    'asn-neighbours-history': {
        title: 'ASN Neighbours History',
        apifunc: 'asn-neighbours-history',
        mparam: ['resource'],
        oparam: [],
        jsfile: 'asn-neighbours-history.js',
        pluginname: 'asnNeighboursHistory',
        minwidth: 256
    },
    
    'blacklist': {
        title: 'Blacklist Entries',
        apifunc: 'blacklist',
        mparam: ['resource'],
        oparam: [],
        jsfile: 'blacklist.js',
        pluginname: 'blacklist',
        minwidth: 320
    },

    'bgp-update-activity': {
        title: 'BGP Update Activity',
        apifunc: 'bgp-update-activity',
        mparam: ['resource'],
        oparam: ['starttime','endtime', 'max_resolution', 'max_points'],
        jsfile: 'bgp-update-activity.js',
        pluginname: 'bgpUpdateActivity',
        minwidth: 160
    },
    
    'country-resource-stats': {
        title: 'Country Resource Stats',
        apifunc: 'country-resource-stats',
        mparam: ['resource'],
        oparam: ['starttime', 'endtime'],
        jsfile: 'country-resource-stats.js',
        pluginname: 'countryResourceStats',
        minwidth: 256  
    },
    
    'forward-dns': {
        title: 'Forward DNS',
        apifunc: 'forward-dns',
        mparam: [],
        oparam: ['resource'],
        jsfile: 'forward-dns.js',
        pluginname: 'forwardDNS',
        minwidth: 160
    },
    
    'geoloc': {
        title: 'Geoloc',
        apifunc: 'geoloc',
        mparam: ['resource'],
        oparam: ['timestamp'],
        jsfile: 'geoloc.js',
        pluginname: 'geoloc',
        minwidth: 255                
    },
    
    'geoloc-history': {
        title: 'Geoloc History',
        apifunc: 'geoloc-history',
        mparam: ['resource'],
        oparam: ['starttime','endtime'],
        jsfile: 'geoloc-history.js',
        pluginname: 'geolocHistory',
        minwidth: 256
    },
    
    'global-networks': {
        title: 'Global Networks',
        apifunc: 'global-networks',
        mparam: [],
        oparam: [],
        jsfile: 'network-info.js',
        pluginname: 'globalNetworks',
        minwidth: 510
    },
    
    'ipv6-launch-day-forward-dns': {
        title: 'IPv4/IPv6 DNS Information For A Website',
        apifunc: 'forward-dns',
        mparam: [],
        oparam: ['resource'],
        jsfile: 'ipv6-launch-day.js',
        pluginname: 'ipv6LaunchDayForwardDNS',
        minwidth: 160
    },
    
    /* Alias for 'ipv6-launch-dns' */
    'ipv6-launch-dns': {
        title: 'IPv4/IPv6 DNS Information For A Website',
        apifunc: 'forward-dns',
        mparam: [],
        oparam: ['resource'],
        jsfile: 'ipv6-launch-day.js',
        pluginname: 'ipv6LaunchDayForwardDNS',
        minwidth: 160
    },

    'looking-glass': {
        title: 'BGP Looking Glass',
        apifunc: 'looking-glass',
        mparam: ['resource'],
        oparam: [],
        jsfile: 'looking-glass.js',
        pluginname: 'lookingGlass', 
        minwidth: 170
    },
    
    'network-info': {
        title: 'Network Information',
        apifunc: 'network-info',
        mparam: ['resource'],
        oparam: ['max_related'],
        jsfile: 'network-info.js',
        pluginname: 'statNetworkInfo',
        minwidth: 160
    },

    'registry-browser': {
        title: 'Registry Browser',
        apifunc: 'registry-browser',
        mparam: ['resource'],
        oparam: ['time', 'use_live_lookups', 'include_backward_refs'],
		defaults: {
			use_live_lookups: 1,
			include_backward_refs: 0
		},
        jsfile: 'registry-browser.js',
        pluginname: 'statRegistryBrowser',
        minwidth: 256
    },

	// Renamed to 'registry-browser'. Kept here for backwards compatibility.
    'object-browser': {
        title: 'Registry Browser',
        apifunc: 'registry-browser',
        mparam: ['resource'],
        oparam: ['time', 'use_live_lookups', 'include_backward_refs'],
		defaults: {
			use_live_lookups: 1,
			include_backward_refs: 0
		},
        jsfile: 'registry-browser.js',
        pluginname: 'statRegistryBrowser',
        minwidth: 256
    },
    
    'prefix-count': {
        title: 'Prefix Count',
        apifunc: 'prefix-count',
        mparam: ['resource'],
        oparam: ['starttime', 'endtime'],
        jsfile: 'prefix-count.js',
        pluginname: 'statPrefixCount',
        minwidth: 160
    },
    
    'prefix-overview': {
        title: 'Resource Overview',
        apifunc: 'prefix-overview',
        mparam: ['resource'],
        oparam: ['max_related'],
        jsfile: 'resource-overview.js',
        pluginname: 'statPrefixOverview',
        defaults: {
            max_related: 50
        },
        minwidth: 160
    },	

    'prefix-routing-consistency': {
        title: 'Prefix Routing Consistency',
        apifunc: 'prefix-routing-consistency',
        mparam: ['resource'],
        jsfile: 'prefix-routing-consistency.js',
        pluginname: 'prefixRoutingConsistency',
        minwidth: 305
    },

    'prefix-size-distribution': {
	    title: 'Prefix Size Distribution',
	    apifunc: 'prefix-size-distribution',
	    mparam: ['resource'],
	    oparam: [],
	    jsfile: 'prefix-distribution.js',
	    pluginname: 'statPrefixSizeDistribution',
	    minwidth: 160
    },

    'related-prefixes': {
        title: 'Related Prefixes',
        apifunc: 'related-prefixes',
        mparam: ['resource'],
        oparam: [],
        jsfile: 'related-prefixes.js',
        pluginname: 'relatedPrefixes',
        minwidth: 280
    }, 
    
    'reverse-dns': {
        title: 'Reverse DNS',
        apifunc: 'reverse-dns',
        mparam: ['resource'],
        oparam: [],
        jsfile: 'reverse-dns.js',
        pluginname: 'statReverseDNS',
        minwidth: 160
    },
    
    'rir-prefix-size-distribution': {
        title: 'RIR Prefix Size Distribution',
        apifunc: 'rir-prefix-size-distribution',
        mparam: ['resource'],
        oparam: [],
        jsfile: 'rir-prefix-size-distribution.js',
        pluginname: 'rirPrefixSizeDistribution',
        minwidth: 250
    },
    
    'rir-prefix-size-distribution-slash-eights': {
        title: 'RIR Prefix Size Distribution',
        apifunc: 'rir-prefix-size-distribution-slash-eights',
        mparam: [],
        oparam: ['dummy', 'query_time'],
        jsfile: 'rir-prefix-size-distribution.js',
        pluginname: 'rirPrefixSizeDistributionSlashEights',
        minwidth: 160  
    },
    
    'routing-status': {
        title: 'Routing Status',
        apifunc: 'routing-status',
        mparam: ['resource'],
        oparam: ['timestamp'],
        jsfile: 'routing-status.js',
        pluginname: 'routingStatus',
        minwidth: 160
    },
    
    'routing-history': {
        title: 'Routing History',
        apifunc: 'routing-history',
        mparam: ['resource'],
        oparam: ['include_first_hop', 'max_groups'],
        jsfile: 'routing-history.js',
        pluginname: 'routingHistory',
        minwidth: 256
    },
    
    'syria-monitor': {
        title: 'Syrian Internet Monitor',
        apifunc: 'syria-monitor',
        mparam: [],
        oparam: ["starttime","endtime"],
        jsfile: 'country-monitor.js',
        pluginname: 'syriaMonitor',
        minwidth: 256
    },
    
    'whats-my-ip': {
        title: 'Your IP Address',
        apifunc: 'whats-my-ip',
        mparam: [],
        oparam: [],
        jsfile: 'network-info.js',
        pluginname: 'statWhatsMyIp',
        minwidth: 160
    },
    
    'whois': {
        title: 'Whois Matches',
        apifunc: 'whois',
        mparam: ['resource'],
        oparam: [],
        jsfile: 'whois.js',
        pluginname: 'statWhois',
        minwidth: 160
    },
    
    'visibility': {
        title: "Visibility",
        apifunc: 'visibility',
        mparam: ['resource'],
        oparam: [],
        jsfile: 'visibility.js',
        pluginname: 'visibility',
        minwidth: 230
    },
    
    // 'world-monitor': {
        // title: 'World Internet Monitor',
        // apifunc: 'country-resource-stats',
        // mparam: ['resource'],
        // oparam: ["starttime","endtime"],
        // jsfile: 'world-monitor.js',
        // pluginname: 'worldMonitor',
        // minwidth: 256
    // },
    
    /* 
     * Internal Widgets  
     */
    'backend-errors': {
        title: 'Backend Errors',
        apifunc: 'backend-errors',
        mparam: [],
        oparam: ['timestamp'],
        jsfile: 'system.js',
        pluginname: 'backendErrors',
        minwidth: 160
    },
    
    '_fake-1': {
        title: 'Fail - there is no matching backend call',
        jsfile: 'fake.js',
        pluginname: 'fakeWidget',
        minwidth: 160
    },
    
    '_fake-error-1': {
        title: 'Fail - the backend call returns an error',
        jsfile: 'fake.js',
        pluginname: 'fakeWidget',
        minwidth: 160
    },
    
    '_fake-error-2': {
        title: 'Fail - invalid input',
        jsfile: 'fake.js',
        pluginname: 'fakeWidget',
        minwidth: 160
    },
    
    '_fake-slow': {
        jsfile: 'fake.js',
        pluginname: 'fakeWidget',
        minwidth: 160
    },
    
    '_fake-ok': {
        jsfile: 'fake.js',
        pluginname: 'fakeWidget',
        minwidth: 160
    },

    '_link': {
        jsfile: 'whois.js',
        pluginname: 'linkWidget',
        apifunc: null,
        minwidth: 160
    },
    
    'performance-data': {
        title: 'Performance Data',
        apifunc: 'performance-data',
        mparam: [],
        oparam: ['timestamp'],
        jsfile: 'system.js',
        pluginname: 'performanceData',
        minwidth: 160
    },

    'result-info-ipv6ld': {
        title: 'Result Info',
        apifunc: 'result-info-ipv6ld',
        mparam: [],
        oparam: ['resource'],
        jsfile: 'result-info.js',
        pluginname: 'resultInfoIPv6LD',
        minwidth: 160
    },
    
    'usage-data': {
        title: 'Usage Data',
        apifunc: 'usage-data',
        mparam: [],
        oparam: ['query_time', 'bin_type', 'data_points', 'show_errors', 'hide_requests'],
        jsfile: 'system.js',
        pluginname: 'usageData',
        minwidth: 160
    },

	'atlas-targets': {
		title: 'RIPE Atlas Measurement Targets',
		apifunc: 'atlas-targets',
		mparam: ['resource'],
		oparam: [],
		jsfile: 'atlas.js',
		pluginname: 'atlasTargets'
	},

	'atlas-probes': {
		title: 'RIPE Atlas Probes',
		apifunc: 'atlas-probes',
		mparam: ['resource'],
		oparam: [],
		jsfile: 'atlas.js',
		pluginname: 'atlasProbes'
	}

};
