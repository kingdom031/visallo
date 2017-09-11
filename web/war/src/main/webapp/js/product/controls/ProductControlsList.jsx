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
        BUTTON: 'button'
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
            const { onFit, tools, rightOffset } = this.props;
            const toolsByType = _.groupBy(tools, (tool) => tool.placementHint || placementHint.MENU);

            return (
                    <div className="controls-list">
                        {toolsByType[placementHint.BUTTON] ?
                            <ul className="extensions">
                                {toolsByType[placementHint.BUTTON].map(tool => (
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
                        <div className="controls-menu-container">
                            <div className="button fit" onClick={onFit}>{i18n('controls.fit')}</div>
                            {toolsByType[placementHint.MENU] ?
                                <ProductControlsMenu
                                    options={toolsByType[placementHint.MENU]}
                                    active={activeOption === MENU_IDENTIFIER}
                                    onToggle={() => { this.onItemClick(MENU_IDENTIFIER) }}
                                />
                            : null}
                        </div>
                    </div>
            );
        },

        onItemClick(identifier) {
            const activeOption = this.state.activeOption;
            this.setState({
                activeOption: activeOption === identifier ? null : identifier
            });
        }
    });

    return ProductControlsList;
});
