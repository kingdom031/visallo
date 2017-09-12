define([
    'create-react-class',
    'prop-types',
    './ProductControlsOption',
    './ProductControlsMenu'
], function(
    createReactClass,
    PropTypes,
    ProductControlsOption,
    ProductControlsMenu) {
    'use strict';

    const placementHint = {
        MENU: 'menu',
        BUTTON: 'button',
        DROPDOWN: 'dropdown'
    };
    const MENU_IDENTIFIER = 'menu';

    const ProductControlsList = createReactClass({

        propTypes: {
            tools: PropTypes.arrayOf(PropTypes.shape({
                identifier: PropTypes.string.isRequired,
                componentPath: PropTypes.string.isRequired,
                button: PropTypes.shape({
                    icon: PropTypes.string,
                    label: PropTypes.string
                }),
                props: PropTypes.object
            })),
            onFit: PropTypes.func,
            rightOffset: PropTypes.number
        },

        getDefaultProps() {
            return {
                tools: []
            }
        },

        getInitialState() {
            return {
                activeOption: null
            }
        },

        componentDidMount() {
            $(document).on('keydown.org-visallo-graph-product-controls', (event) => {
                if (event.which === 27) { //esc
                    this.setState({ activeOption: null });
                }
            });
        },

        componentWillUnmount() {
            $(document).off('keydown.org-visallo-graph-product-controls');
        },

        render() {
            const { activeOption } = this.state;
            const { onFit, onZoom, tools, rightOffset } = this.props;
            const menuOptions = [], listOptions = [];
            const groupByPlacement = (tool) => {
               const { placementHint, icon, label, componentPath, handler } = tool;

               if (placementHint) {
                   if (placementHint === placementHint.MENU) {
                       menuOptions.push(tool);
                   } else {
                       listOptions.push(tool);
                   }
               } else if (icon || label || handler) {
                   listOptions.push(tool);
               } else {
                   menuOptions.push(tool);
               }
            };

            tools.concat(this.getDefaultOptions()).forEach(groupByPlacement);

            return (
                    <div className="controls-list">
                        {listOptions.length ?
                            <ul className="extensions">
                                {listOptions.map(tool => (
                                    <ProductControlsOption
                                        tool={tool}
                                        active={activeOption === tool.identifier}
                                        key={tool.identifier}
                                        onClick={() => {this.onItemClick(tool.identifier) }}
                                        rightOffset={rightOffset}
                                    />
                                ))}
                            </ul>
                        : null}
                        {menuOptions.length ?
                            <ProductControlsMenu
                                options={menuOptions}
                                active={activeOption === MENU_IDENTIFIER}
                                onToggle={() => { this.onItemClick(MENU_IDENTIFIER) }}
                            />
                        : null}
                    </div>
            );
        },

        onItemClick(identifier) {
            if (identifier) {
                const activeOption = this.state.activeOption;

                this.setState({
                    activeOption: activeOption === identifier ? null : identifier
                });
            }
        },

        getDefaultOptions() {
            const defaultOptions = [];
            const { onZoom, onFit } = this.props;

            if (onZoom) {
                defaultOptions.push({
                    identifier: 'org-visallo-product-zoom-in',
                    placementHint: 'button',
                    label: '+',
                    props: { handler: _.partial(onZoom, 'in') },
                    buttonClass: 'zoom'
                }, {
                    identifier: 'org-visallo-product-zoom-out',
                    placementHint: 'button',
                    label: '-',
                    props: { handler: _.partial(onZoom, 'out') },
                    buttonClass: 'zoom'
                })
            }

            if (onFit) {
                defaultOptions.push({
                    identifier: 'org-visallo-product-fit',
                    placementHint: 'button',
                    label: 'Fit',
                    props: { handler: onFit}
                })
            }

            return defaultOptions;
        }
    });

    return ProductControlsList;
});
