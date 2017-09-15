define([
    'create-react-class',
    'prop-types',
    'configuration/plugins/registry',
    'components/RegistryInjectorHOC',
    './ProductControlsOption',
    './ProductControlsMenu'
], function(
    createReactClass,
    PropTypes,
    registry,
    RegistryInjectorHOC,
    ProductControlsOption,
    ProductControlsMenu) {
    'use strict';

    /**
     * Plugin to add custom options components (Flight or React) which display in toolbar at the top right of a product.
     *
     * @param {string} identifier Unique id for this option item
     * @param {string} optionComponentPath Path to {@link org.visallo.product.options~Component} to render
     * @param {func} canHandle Given `product` should this option be placed
     * @param {string} [placementHint=menu] How this option should be displayed in the toolbar
     * * `menu` inside the hamburger menu list
     * * `popover` as a button that will expand a popover where the component is rendered.
     *   If specified one of `icon` or `label` is required. Also passed {@link org.visallo.product.options.popover~onResize}
     * * `button` as an inline button component
     * @param {string} [buttonClass] Css class to add to the button element when placed as `button` or `popover`
     * @param {string} [icon] Path to the icon to render when displayed as a `popover`
     * @param {string} [label] Label text to render when displayed as a `popover`
     */
    registry.documentExtensionPoint('org.visallo.product.options',
        'Add components to the product options toolbar',
        function(e) {
            return ('identifier' in e) && ('canHandle' in e && _.isFunction(e.canHandle))
                && (['optionComponentPath', 'icon', 'label'].some(key => key in e));
        },
        'http://docs.visallo.org/extension-points/front-end/productOptions'
    );

    const placementHint = {
        MENU: 'menu',
        BUTTON: 'button',
        POPOVER: 'popover'
    };
    const MENU_IDENTIFIER = 'menu';
    const HOVER_OPEN_DELAY = 600;

    const ProductControls = createReactClass({

        propTypes: {
            product: PropTypes.shape({
                kind: PropTypes.string.isRequired
            }).isRequired,
            registry: PropTypes.object.isRequired,
            injectedProductProps: PropTypes.object,
            showNavigationControls: PropTypes.bool,
            onFit: PropTypes.func,
            onZoom: PropTypes.func,
            rightOffset: PropTypes.number
        },

        getDefaultProps() {
            return {
                rightOffset: 0,
                showNavigationControls: false,
                injectedProductProps: {}
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
            const { onFit, onZoom, rightOffset, registry, injectedProductProps, product } = this.props;
            const menuOptions = [], listOptions = [];
            const groupByPlacement = (option) => {
               const { placementHint, icon, label } = option;

               if (placementHint) {
                   if (placementHint === placementHint.MENU) {
                       menuOptions.push(option);
                   } else {
                       listOptions.push(option);
                   }
               } else if (icon || label) {
                   listOptions.push(option);
               } else {
                   menuOptions.push(option);
               }
            };
            const options = [
                ...registry['org.visallo.product.options'],
                ...this.getDefaultOptions(),
                ...this.mapDeprecatedOptions()
            ];

            options
                .map(option => ({ ...option, props: { ...option.props, ...injectedProductProps}}))
                .filter(option => option.canHandle(product))
                .forEach(groupByPlacement);

            return (
                <div className="product-controls" style={{transform: `translate(-${rightOffset}px, 0)`}}>
                    <div className="controls-list">
                        {listOptions.length ?
                            <ul className="extensions">
                                {listOptions.map(option => (
                                    <ProductControlsOption
                                        option={option}
                                        active={activeOption === option.identifier}
                                        key={option.identifier}
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
            const { showNavigationControls, onZoom, onFit } = this.props;

            return ([
                {
                    identifier: 'org-visallo-product-zoom-out',
                    placementHint: 'button',
                    label: '-',
                    props: { handler: _.partial(onZoom, 'out') },
                    buttonClass: 'zoom',
                    canHandle: () => showNavigationControls && !!onZoom
                },
                {
                    identifier: 'org-visallo-product-zoom-in',
                    placementHint: 'button',
                    label: '+',
                    props: { handler: _.partial(onZoom, 'in') },
                    buttonClass: 'zoom',
                    canHandle: () => showNavigationControls && !!onZoom
                },
                {
                    identifier: 'org-visallo-product-fit',
                    placementHint: 'button',
                    label: 'Fit',
                    props: { handler: onFit},
                    canHandle: () => showNavigationControls && !!onFit
                }
            ]);
        },

        mapDeprecatedOptions() {
            const { product, registry } = this.props;
            const options = [];

            ['org.visallo.map.options', 'org.visallo.graph.options'].forEach(extensionPoint => {
                const productKind = extensionPoint === 'org.visallo.graph.options' ?
                    'org.visallo.web.product.graph.GraphWorkProduct' : 'org.visallo.web.product.map.MapWorkProduct';

                registry[extensionPoint].forEach(option => {
                    options.push({
                        ...option,
                        canHandle: (product) => product.kind === productKind
                    })
                });
            });

            return options;
        }
    });

    return RegistryInjectorHOC(ProductControls, [
        'org.visallo.graph.options',
        'org.visallo.map.options',
        'org.visallo.product.options'
    ]);
});
