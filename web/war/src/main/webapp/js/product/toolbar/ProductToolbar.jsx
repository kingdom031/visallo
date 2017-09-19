define([
    'create-react-class',
    'prop-types',
    'configuration/plugins/registry',
    'components/RegistryInjectorHOC',
    './ProductToolbarItem',
    './ProductToolbarMenu'
], function(
    createReactClass,
    PropTypes,
    registry,
    RegistryInjectorHOC,
    ProductToolbarItem,
    ProductToolbarMenu) {
    'use strict';

    /**
     * Plugin to add custom item components (Flight or React) which display in toolbar at the top right of a product.
     *
     * @param {string} identifier Unique id for this item
     * @param {string} itemComponentPath Path to {@link org.visallo.product.toolbar.item~Component} to render
     * @param {func} canHandle Given `product` should this item be placed
     * @param {string} [placementHint=menu] How this item should be displayed in the toolbar
     * * `menu` inside the hamburger menu list
     * * `popover` as a button that will expand a popover where the component is rendered.
     *   If specified one of `icon` or `label` is required. Also passed {@link org.visallo.product.toolbar.popover~onResize}
     * * `button` as an inline button component
     * @param {string} [buttonClass] Css class to add to the button element when placed as `button` or `popover`
     * @param {string} [icon] Path to the icon to render when displayed as a `popover`
     * @param {string} [label] Label text to render when displayed as a `popover`
     */
    registry.documentExtensionPoint('org.visallo.product.toolbar.item',
        'Add components to the product toolbar',
        function(e) {
            return ('identifier' in e) && ('canHandle' in e && _.isFunction(e.canHandle))
                && (['itemComponentPath', 'icon', 'label'].some(key => key in e));
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

    const ProductToolbar = createReactClass({

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
                activeItem: null,
                stayOpen: false
            }
        },

        componentDidMount() {
            $(document).on('keydown.org-visallo-graph-product-toolbar', (event) => {
                if (event.which === 27) { //esc
                    this.setState({ activeItem: null, stayOpen: false });
                }
            });
        },

        componentDidUpdate(prevState, prevProps) {
            if (this.state.stayOpen && this.openItemTimeout) {
                clearTimeout(this.openItemTimeout);
                this.openItemTimeout = null;
            }
        },

        componentWillUnmount() {
            $(document).off('keydown.org-visallo-graph-product-toolbar');
        },

        render() {
            const { activeItem } = this.state;
            const { onFit, onZoom, rightOffset, registry, injectedProductProps, product } = this.props;
            const menuItems = [], listItems = [];
            const groupByPlacement = (item) => {
               const { placementHint, icon, label } = item;

               if (placementHint) {
                   if (placementHint === placementHint.MENU) {
                       menuItems.push(item);
                   } else {
                       listItems.push(item);
                   }
               } else if (icon || label) {
                   listItems.push(item);
               } else {
                   menuItems.push(item);
               }
            };
            const items = [
                ...registry['org.visallo.product.toolbar.item'],
                ...this.getDefaultItems(),
                ...this.mapDeprecatedItems()
            ];

            items
                .map(item => ({ ...item, props: { ...item.props, ...injectedProductProps}}))
                .filter(item => item.canHandle(product))
                .forEach(groupByPlacement);

            return (
                <div className="product-toolbar" style={{transform: `translate(-${rightOffset}px, 0)`}}>
                    <div className="toolbar-list">
                        {listItems.length ?
                            <ul className="extensions">
                                {listItems.map(item => (
                                    <ProductToolbarItem
                                        item={item}
                                        active={activeItem === item.identifier}
                                        key={item.identifier}
                                        onClick={this.onItemClick}
                                        onItemMouseEnter={this.onItemMouseEnter}
                                        onItemMouseLeave={this.onItemMouseLeave}
                                        rightOffset={rightOffset}
                                    />
                                ))}
                            </ul>
                        : null}
                        {menuItems.length ?
                            <ProductToolbarMenu
                                items={menuItems}
                                active={activeItem === MENU_IDENTIFIER}
                                identifier={MENU_IDENTIFIER}
                                onToggle={this.onItemClick}
                                onItemMouseEnter={this.onItemMouseEnter}
                                onItemMouseLeave={this.onItemMouseLeave}
                            />
                        : null}
                    </div>
                </div>
            );
        },

        onItemClick(identifier) {
            const { activeItem, stayOpen } = this.state;

            if (activeItem) {
                if (activeItem === identifier && !stayOpen) {
                    this.setState({ stayOpen: true });
                } else if (activeItem === identifier) {
                    this.setActiveItem();
                } else {
                    this.setActiveItem(activeItem, true);
                }
            } else if (identifier) {
                this.setActiveItem(identifier, true);
            } else {
                this.setActiveItem();
            }
        },

        onItemMouseEnter(identifier) {
            if (!this.state.stayOpen) {
                this.openItemTimeout = setTimeout(() => { this.setActiveItem(identifier) }, HOVER_OPEN_DELAY);
            }
        },

        onItemMouseLeave(identifier) {
            if (!this.state.stayOpen) {
                const { activeItem, stayOpen } = this.state;

                if (this.openItemTimeout) {
                    clearTimeout(this.openItemTimeout);
                    this.openItemTimeout = null;
                }

                if (activeItem && !stayOpen) {
                    this.setActiveItem();
                }
            }
        },

        setActiveItem(activeItem = null, stayOpen = false) {
            this.setState({ activeItem, stayOpen });
        },

        getDefaultItems() {
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

        mapDeprecatedItems() {
            const { product, registry } = this.props;
            const items = [];

            ['org.visallo.map.options', 'org.visallo.graph.options'].forEach(extensionPoint => {
                const productKind = extensionPoint === 'org.visallo.graph.options' ?
                    'org.visallo.web.product.graph.GraphWorkProduct' : 'org.visallo.web.product.map.MapWorkProduct';

                registry[extensionPoint].forEach(item => {
                    const { optionComponentPath, ...config } = item;
                    const mappedItem = {
                        ...config,
                        canHandle: (product) => product.kind === productKind
                    };

                    if (optionComponentPath) {
                        mappedItem.itemComponentPath = optionComponentPath;
                    }

                    items.push(mappedItem);
                });
            });

            return items;
        }
    });

    return RegistryInjectorHOC(ProductToolbar, [
        'org.visallo.graph.options',
        'org.visallo.map.options',
        'org.visallo.product.toolbar.item'
    ]);
});
