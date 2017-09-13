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
        POPOVER: 'popover'
    };
    const MENU_IDENTIFIER = 'menu';
    const HOVER_OPEN_DELAY = 600;

    const ProductControls = createReactClass({

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
            onZoom: PropTypes.func,
            rightOffset: PropTypes.number
        },

        getDefaultProps() {
            return {
                tools: [],
                rightOffset: 0
            }
        },

        getInitialState() {
            return {
                activeOption: null,
                stayOpen: false
            }
        },

        componentDidMount() {
            $(document).on('keydown.org-visallo-graph-product-controls', (event) => {
                if (event.which === 27) { //esc
                    this.setState({ activeOption: null, stayOpen: false });
                }
            });
        },

        componentDidUpdate(prevState, prevProps) {
            if (this.state.stayOpen && this.openOptionTimeout) {
                clearTimeout(this.openOptionTimeout);
                this.openOptionTimeout = null;
            }
        },

        componentWillUnmount() {
            $(document).off('keydown.org-visallo-graph-product-controls');
        },

        render() {
            const { activeOption } = this.state;
            const { onFit, onZoom, tools, rightOffset } = this.props;
            const menuOptions = [], listOptions = [];
            const groupByPlacement = (tool) => {
               const { placementHint, icon, label, componentPath } = tool;

               if (placementHint) {
                   if (placementHint === placementHint.MENU) {
                       menuOptions.push(tool);
                   } else {
                       listOptions.push(tool);
                   }
               } else if (icon || label) {
                   listOptions.push(tool);
               } else {
                   menuOptions.push(tool);
               }
            };

            tools.concat(this.getDefaultOptions()).forEach(groupByPlacement);

            return (
                <div className="product-controls" style={{transform: `translate(-${rightOffset}px, 0)`}}>
                    <div className="controls-list">
                        {listOptions.length ?
                            <ul className="extensions">
                                {listOptions.map(tool => (
                                    <ProductControlsOption
                                        tool={tool}
                                        active={activeOption === tool.identifier}
                                        key={tool.identifier}
                                        onClick={this.onOptionClick}
                                        onOptionMouseEnter={this.onOptionMouseEnter}
                                        onOptionMouseLeave={this.onOptionMouseLeave}
                                        rightOffset={rightOffset}
                                    />
                                ))}
                            </ul>
                        : null}
                        {menuOptions.length ?
                            <ProductControlsMenu
                                options={menuOptions}
                                active={activeOption === MENU_IDENTIFIER}
                                identifier={MENU_IDENTIFIER}
                                onToggle={this.onOptionClick}
                                onOptionMouseEnter={this.onOptionMouseEnter}
                                onOptionMouseLeave={this.onOptionMouseLeave}
                            />
                        : null}
                    </div>
                </div>
            );
        },

        onOptionClick(identifier) {
            const { activeOption, stayOpen } = this.state;

            if (activeOption) {
                if (activeOption === identifier && !stayOpen) {
                    this.setState({ stayOpen: true });
                } else if (activeOption === identifier) {
                    this.setActiveOption();
                } else {
                    this.setActiveOption(activeOption, true);
                }
            } else if (identifier) {
                this.setActiveOption(identifier, true);
            } else {
                this.setActiveOption();
            }
        },

        onOptionMouseEnter(identifier) {
            if (!this.state.stayOpen) {
                this.openOptionTimeout = setTimeout(() => { this.setActiveOption(identifier) }, HOVER_OPEN_DELAY);
            }
        },

        onOptionMouseLeave(identifier) {
            if (!this.state.stayOpen) {
                const { activeOption, stayOpen } = this.state;

                if (this.openOptionTimeout) {
                    clearTimeout(this.openOptionTimeout);
                    this.openOptionTimeout = null;
                }

                if (activeOption && !stayOpen) {
                    this.setActiveOption();
                }
            }
        },

        setActiveOption(activeOption = null, stayOpen = false) {
            this.setState({ activeOption, stayOpen });
        },

        getDefaultOptions() {
            const defaultOptions = [];
            const { onZoom, onFit } = this.props;

            if (onZoom) {
                defaultOptions.push( {
                    identifier: 'org-visallo-product-zoom-out',
                    placementHint: 'button',
                    label: '-',
                    props: { handler: _.partial(onZoom, 'out') },
                    buttonClass: 'zoom'
                }, {
                    identifier: 'org-visallo-product-zoom-in',
                    placementHint: 'button',
                    label: '+',
                    props: { handler: _.partial(onZoom, 'in') },
                    buttonClass: 'zoom'
                });
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

    return ProductControls;
});
