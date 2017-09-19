define([
    'create-react-class',
    'prop-types',
    './OpenLayers',
    'configuration/plugins/registry',
    'util/vertex/formatters',
    'util/mapConfig'
], function(createReactClass, PropTypes, OpenLayers, registry, F, mapConfig) {
    'use strict';

    /**
     * @deprecated Use {@link org.visallo.product.toolbar.item} instead
     */
    registry.documentExtensionPoint('org.visallo.map.options',
        'Add components to the map options toolbar',
        function(e) {
            return ('identifier' in e) && ('optionComponentPath' in e);
        },
        'http://docs.visallo.org/extension-points/front-end/mapOptions'
    );

    const Map = createReactClass({

        propTypes: {
            configProperties: PropTypes.object.isRequired,
            onUpdateViewport: PropTypes.func.isRequired,
            onSelectElements: PropTypes.func.isRequired,
            onVertexMenu: PropTypes.func.isRequired,
            elements: PropTypes.shape({ vertices: PropTypes.object, edges: PropTypes.object })
        },

        getInitialState() {
            return { viewport: this.props.viewport, generatePreview: true }
        },

        render() {
            const { viewport, generatePreview } = this.state;
            const { product, onSelectElements, onUpdatePreview } = this.props;

            return (
                <div style={{height:'100%'}} ref={r => {this.wrap = r}}>
                <OpenLayers
                    product={product}
                    features={this.mapElementsToFeatures()}
                    viewport={viewport}
                    generatePreview={generatePreview}
                    panelPadding={this.props.panelPadding}
                    onTap={this.onTap}
                    onPan={this.onViewport}
                    onZoom={this.onViewport}
                    onContextTap={this.onContextTap}
                    onSelectElements={onSelectElements}
                    onUpdatePreview={onUpdatePreview.bind(this, this.props.product.id)}
                    {...mapConfig()}
                />
                </div>
            )
        },

        componentWillReceiveProps(nextProps) {
            if (nextProps.product.id === this.props.product.id) {
                this.setState({ viewport: {}, generatePreview: false })
            } else {
                this.saveViewport(this.props)
                this.setState({ viewport: nextProps.viewport || {}, generatePreview: true })
            }
        },

        componentDidMount() {
            $(this.wrap).on('selectAll', (event) => {
                this.props.onSelectAll(this.props.product.id);
            })
            $(document).on('elementsCut.org-visallo-map', (event, { vertexIds }) => {
                this.props.onRemoveElementIds({ vertexIds, edgeIds: [] });
            })
            $(document).on('elementsPasted.org-visallo-map', (event, elementIds) => {
                this.props.onDropElementIds(elementIds)
            })

            this.legacyListeners({
                fileImportSuccess: { node: $('.products-full-pane.visible')[0], handler: (event, { vertexIds }) => {
                    this.props.onDropElementIds({vertexIds});
                }}
            })
        },

        componentWillUnmount() {
            this.removeEvents.forEach(({ node, func, events }) => {
                $(node).off(events, func);
            });

            $(this.wrap).off('selectAll');
            $(document).off('.org-visallo-map');
            this.saveViewport(this.props)
        },

        onTap({map, pixel}) {
            if (!map.hasFeatureAtPixel(pixel)) {
                this.props.onClearSelection();
            }
        },

        onContextTap({map, pixel, originalEvent}) {
            const vertexIds = [];
            map.forEachFeatureAtPixel(pixel, cluster => {
                cluster.get('features').forEach(f => {
                    vertexIds.push(f.getId());
                })
            })

            if (vertexIds.length) {
                const { pageX, pageY } = originalEvent;
                this.props.onVertexMenu(
                    originalEvent.target,
                    vertexIds[0],
                    { x: pageX, y: pageY }
                );
            }
        },

        onViewport(event) {
            const view = event.target;

            var zoom = view.getResolution(), pan = view.getCenter();
            if (!this.currentViewport) this.currentViewport = {};
            this.currentViewport[this.props.product.id] = { zoom, pan: [...pan] };
        },

        saveViewport(props) {
            var productId = props.product.id;
            if (this.currentViewport && productId in this.currentViewport) {
                var viewport = this.currentViewport[productId];
                props.onUpdateViewport(productId, viewport);
            }
        },

        mapElementsToFeatures() {
            const { vertices, edges } = this.props.elements;
            const elementsSelectedById = { ..._.indexBy(this.props.selection.vertices), ..._.indexBy(this.props.selection.edges) };
            const elements = Object.values(vertices).concat(Object.values(edges));
            const geoLocationProperties = _.groupBy(this.props.ontologyProperties, 'dataType').geoLocation;

            return elements.map(el => {
                const geoLocations = geoLocationProperties &&
                    _.chain(geoLocationProperties)
                        .map(function(geoLocationProperty) {
                            return F.vertex.props(el, geoLocationProperty.title);
                        })
                        .compact()
                        .flatten()
                        .filter(function(g) {
                            return g.value && g.value.latitude && g.value.longitude;
                        })
                        .map(function(g) {
                            return [g.value.longitude, g.value.latitude];
                        })
                        .value(),
                    // TODO: check with edges
                    conceptType = F.vertex.prop(el, 'conceptType'),
                    selected = el.id in elementsSelectedById,
                    iconUrl = 'map/marker/image?' + $.param({
                        type: conceptType,
                        workspaceId: this.props.workspaceId,
                        scale: this.props.pixelRatio > 1 ? '2' : '1',
                    }),
                    iconUrlSelected = `${iconUrl}&selected=true`;

                return {
                    id: el.id,
                    element: el,
                    selected,
                    iconUrl,
                    iconUrlSelected,
                    iconSize: [22, 40].map(v => v * this.props.pixelRatio),
                    iconAnchor: [0.5, 1.0],
                    pixelRatio: this.props.pixelRatio,
                    geoLocations
                }
            })
        },

        getTilePropsFromConfiguration() {
            const config = {...this.props.configProperties};
            const getOptions = function(providerName) {
                try {
                    var obj,
                        prefix = `map.provider.${providerName}.`,
                        options = _.chain(config)
                        .pick((val, key) => key.indexOf(`map.provider.${providerName}.`) === 0)
                        .tap(o => { obj = o })
                        .pairs()
                        .map(([key, value]) => {
                            if (/^[\d.-]+$/.test(value)) {
                                value = parseFloat(value, 10);
                            } else if ((/^(true|false)$/).test(value)) {
                                value = value === 'true'
                            } else if ((/^\[[^\]]+\]$/).test(value) || (/^\{[^\}]+\}$/).test(value)) {
                                value = JSON.parse(value)
                            }
                            return [key.replace(prefix, ''), value]
                        })
                        .object()
                        .value()
                    return options;
                } catch(e) {
                    console.error(`${prefix} options could not be parsed. input:`, obj)
                    throw e;
                }
            };

            var source = config['map.provider'] || 'osm';
            var sourceOptions;

            if (source === 'google') {
                console.warn('google map.provider is no longer supported, switching to OpenStreetMap provider');
                source = 'osm';
            }

            if (source === 'osm') {
                // Legacy configs accepted csv urls, warn and pick first
                var osmURL = config['map.provider.osm.url'];
                if (osmURL && osmURL.indexOf(',') >= 0) {
                    console.warn('Comma-separated Urls not supported, using first url. Use urls with {a-c} for multiple CDNS');
                    console.warn('For Example: https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png');
                    config['map.provider.osm.url'] = osmURL.split(',')[0].trim().replace(/[$][{]/g, '{');
                }
                sourceOptions = getOptions('osm');
                source = 'OSM';
            } else if (source === 'ArcGIS93Rest') {
                var urlKey = 'map.provider.ArcGIS93Rest.url';
                // New OL3 ArcGIS Source will throw an error if url doesn't end
                // with [Map|Image]Server
                if (config[urlKey]) {
                    config[urlKey] = config[urlKey].replace(/\/export(Image)?\/?\s*$/, '');
                }
                sourceOptions = { params: { layers: 'show:0,1,2' }, ...getOptions(source) };
                source = 'TileArcGISRest'
            } else {
                sourceOptions = getOptions(source)
            }

            return { source, sourceOptions };
        },

        legacyListeners(map) {
            this.removeEvents = [];

            _.each(map, (handler, events) => {
                var node = this.wrap;
                var func = handler;
                if (!_.isFunction(handler)) {
                    node = handler.node;
                    func = handler.handler;
                }
                this.removeEvents.push({ node, func, events });
                $(node).on(events, func);
            })
        }
    });

    return Map;
});
