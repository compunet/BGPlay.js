addTemplateContent('infoPanel.html', '<div class="bgplayTitle">Info</div>'+
'{{#node}}'+
'{{#node.id}}<div><b>Node ID:</b> {{node.id}}</div>{{/node.id}}'+
'{{#node.attributes.as}}<div><b>AS:</b> {{node.attributes.as}}</div>{{/node.attributes.as}}'+
'{{#node.attributes.owner}}<div><b>Owner:</b> {{node.attributes.owner}}</div>{{/node.attributes.owner}}'+
'{{#isASource}}'+
'<div><b>Collector peers:</b> {{#collectorPeers}}{{id}}  {{/collectorPeers}}</div>'+
'{{/isASource}}'+
'<!--{{#node.attributes.nodeUrl}}<div><b>Url:</b> <a href="http://bgp.potaroo.net{{node.attributes.nodeUrl}}">click</a></div>{{/node.attributes.nodeUrl}}-->'+
'{{#node.attributes.country}}<div><b>Country:</b> {{node.attributes.country}}</div>{{/node.attributes.country}}'+
'{{/node}}'+
''+
'{{#path}}'+
'{{^node}}'+
'{{#path.attributes.source}}<div><b>Source:</b> {{path.attributes.source}}</div>{{/path.attributes.source}}'+
'{{#path.attributes.target}}<div><b>Target:</b> {{path.attributes.target}}</div>{{/path.attributes.target}}'+
'{{#pathString}}<div><b>Current Path:</b> {{pathString}}</div>{{/pathString}}'+
'{{#pathStatistics}}<div><b>Statistics:</b> {{pathStatistics}}</div>{{/pathStatistics}}'+
'{{/node}}'+
'{{/path}}'+
''+
'{{^node}}'+
'{{^path}}'+
''+
'{{^lastEvent.isInitialInstant}}'+
'<div>'+
'    {{#lastEvent.attributes.subType}}<b>Type:</b> {{lastEvent.attributes.type}} &gt; {{lastEvent.attributes.subType}}{{/lastEvent.attributes.subType}}'+
'    {{#lastEvent.attributes.target}} <b>Involving:</b> {{lastEvent.attributes.target}}{{/lastEvent.attributes.target}}'+
'</div>'+
'{{#lastEvent.attributes.shortdescription}}<div><b>Short description:</b> {{lastEvent.attributes.shortdescription}}</div>{{/lastEvent.attributes.shortdescription}}'+
'<!--{{#lastEvent.attributes.longdescription}}<div><b>Long description:</b> {{lastEvent.attributes.longdescription}}</div>{{/lastEvent.attributes.longdescription}}-->'+
'<!--{{#lastEvent.attributes.path}}<div><b>Path:</b> {{lastEvent.attributes.path}}</div>{{/lastEvent.attributes.path}}-->'+
''+
'{{#lastEvent.attributes.path}}'+
'<div>'+
'    <b>Path:</b>'+
'    {{#lastEvent.attributes.path.attributes.nodes}}<a href="javascript:void(0);" class="bgplayAsLink">{{id}}</a>, {{/lastEvent.attributes.path.attributes.nodes}}'+
'</div>'+
'{{/lastEvent.attributes.path}}'+
''+
'{{#lastEvent.attributes.community}}<div><b>Community:</b> {{lastEvent.attributes.community}}</div>{{/lastEvent.attributes.community}}'+
'<div>'+
'    {{#lastEvent.attributes.instant}}<b>Date and time:</b> {{lastEvent.attributes.instant.getDate}}{{/lastEvent.attributes.instant}}'+
'    {{#lastEvent.attributes.source}} <b>Collected by:</b> {{lastEvent.attributes.source}}{{/lastEvent.attributes.source}}'+
'</div>'+
'{{/lastEvent.isInitialInstant}}'+
''+
''+
'{{#lastEvent.isInitialInstant}}'+
'{{#lastEvent.attributes.subType}}<div><b>Type:</b> Initial state</div>{{/lastEvent.attributes.subType}}'+
'<div><b>Number of ASes:</b> {{numberOfNodes}}</div>'+
'<div><b>Number of collector peers:</b> {{numberOfCollectorPeers}}</div>'+
'<div><b>Selected RRCs:</b> {{environment.params.selectedRrcs}}</div>'+
'<div><b>Total number of events:</b> {{numberOfEvents}}</div>'+
''+
'{{#lastEvent.attributes.instant}}<div><b>Date and time:</b> {{lastEvent.attributes.instant.getDate}}</div>{{/lastEvent.attributes.instant}}'+
'{{/lastEvent.isInitialInstant}}'+
'{{/path}}'+
'{{/node}}'+
''+
'<!--<div class="more">more</div>-->');