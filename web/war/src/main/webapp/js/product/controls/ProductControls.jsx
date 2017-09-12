define([
    'create-react-class',
    'prop-types',
    'components/Attacher',
    './NavigationControls',
    './ProductControlsList'
], function(
    createReactClass,
    PropTypes,
    Attacher,
    NavigationControls,
    ProductControlsList) {
    'use strict';
    const navigationButtons = [
        { identifier: 'product-navigation-zoom-in', }
    ];

    const ProductControls = createReactClass({

        propTypes: {
            tools: PropTypes.arrayOf(PropTypes.shape({
                identifier: PropTypes.string.isRequired,
                componentPath: PropTypes.string.isRequired,
                props: PropTypes.object,
                placementHint: PropTypes.string,
                icon: PropTypes.string,
                label: PropTypes.string
            })),
            rightOffset: PropTypes.number,
            zoom: PropTypes.bool,
            pan: PropTypes.bool,
            onZoom: PropTypes.func,
            onPan: PropTypes.func,
            onFit: PropTypes.func
        },

        getDefaultProps() {
            return {
                tools: [],
                rightOffset: 0
            }
        },

        render() {
            const { tools, rightOffset, onFit, ...navigationProps } = this.props;
            const { onPan, onZoom } = navigationProps;

            return (
                <div className="product-controls" style={{transform: `translate(-${rightOffset}px, 0)`}}>
                    <ProductControlsList tools={tools} onFit={onFit} rightOffset={rightOffset} onZoom={onZoom} />
                </div>
            );
        },
    });

    return ProductControls;
});
