define([
    'create-react-class',
    'prop-types',
    '../Attacher',
    './NavControlsList'
], function(
    createReactClass,
    PropTypes,
    Attacher,
    NavControlsList) {
    'use strict';

    const PAN_INACTIVE_AREA = 8;
    const PAN_AREA_DRAG_SIZE = 75;
    const PAN_SPEED = 10;
	const PAN_MIN_PERCENT_SPEED = 0.25;
	const PAN_DISTANCE = 10;
    const STATE_PANNING = { state: 'panning' };
    const STATE_START = { state: 'panningStart' };
    const STATE_END = { state: 'panningEnd' };
    const EMPTY = { x: 0, y: 0 };

    const NavControls = createReactClass({

        propTypes: {
            zoom: PropTypes.bool,
            pan: PropTypes.bool,
            tools: PropTypes.arrayOf(PropTypes.shape({
                identifier: PropTypes.string.isRequired,
                componentPath: PropTypes.string.isRequired,
                props: PropTypes.object
            })),
            rightOffset: PropTypes.number,
            onZoom: PropTypes.func,
            onPan: PropTypes.func,
            onFit: PropTypes.func
        },

        getDefaultProps() {
            const noop = () => {}
            return {
                zoom: true,
                pan: true,
                tools: [],
                rightOffset: 0,
                onZoom: noop,
                onPan: noop,
                onFit: noop
            }
        },

        getInitialState() {
            return {
                panning: false
            }
        },

        componentDidMount() {
            //TODO: esc keyup close
        },

        componentWillUnmount() {
            //TODO: off esc keyup close
        },

        render() {
            const { tools, rightOffset } = this.props;
            const panningCls = 'panner' + (this.state.panning ? ' active' : '');
            const panningStyle = this.state.panning && this.state.pan ? {
                    background: `radial-gradient(circle at ${calculatePosition(this.state.pan)}, #575757, #929292 60%)`
            } : {};

            return (
                <div className="controls" style={{transform: `translate(-${rightOffset}px, 0)`}}>
                    <NavControlsList tools={tools} onFit={this.onFit} />
                    <div
                        ref="panner"
                        style={panningStyle}
                        className={panningCls}
                        onMouseDown={this.onPanMouseDown}
                    >
                        <div className="arrow-bottom"/>
                        <div className="arrow-right"/>
                        <div className="arrow-top"/>
                        <div className="arrow-left"/>
                    </div>
                    <button
                        onMouseDown={this.onZoom}
                        onMouseUp={this.onZoom}
                        className="zoom" data-type="out"
                    >
                        -
                    </button>
                    <button
                        onMouseDown={this.onZoom}
                        onMouseUp={this.onZoom}
                        className="zoom" data-type="in"
                    >
                        +
                    </button>
                </div>
            );
        },

        onPanMouseDown(event) {
            this.props.onPan(EMPTY, STATE_START);
            this._pannerClientBounds = this.refs.panner.getBoundingClientRect();
            this._handlePanMove(event.nativeEvent);
            window.addEventListener('mousemove', this._handlePanMove, false);
            window.addEventListener('mouseup', this._handlePanUp, false);

            this.setState({ panning: true })
        },

        onFit(event) {
            this.props.onFit();
        },

        onZoom(event) {
            const e = event.nativeEvent;
            switch (e.type) {
                case 'mousedown':
                    this._handleZoomMouseDown(event);
                    break;
                case 'mouseup':
                    this._handleZoomMouseUp();
                    break;
            }
        },

        _handleZoomMouseDown(event) {
            const zoomType = event.target.dataset.type;
            window.addEventListener('mouseup', this._handleZoomMouseUp, false);
            this.zoomTimer = setInterval(() => {
                this.props.onZoom(zoomType);
            }, PAN_SPEED);
        },

        _handleZoomMouseUp(event) {
            clearInterval(this.zoomTimer);
            window.removeEventListener('mouseup', this._handleZoomMouseUp)
        },

        _handlePanMove(event) {
            event.preventDefault();
            event.stopPropagation();
            clearInterval(this.panInterval);

            var pan = eventToPan(this._pannerClientBounds, event);
            if (isNaN(pan.x) || isNaN(pan.y)) {
                this.setState({ pan: null })
                return;
            }

            var self = this;
            this.panInterval = setInterval(() => {
                this.setState({ pan })
                this.props.onPan(pan, STATE_PANNING);
            }, PAN_SPEED);
        },

        _handlePanUp(event) {
            this.props.onPan(EMPTY, STATE_END);
            clearInterval(this.panInterval);
            window.removeEventListener('mousemove', this._handlePanMove);
            window.removeEventListener('mouseup', this._handlePanUp);
            this.setState({ panning: false })
        }
    });

    return NavControls;

    // Ported from jquery.cytoscape-panzoom plugin
    function eventToPan(bounds, e) {
        var v = {
                x: Math.round(e.pageX - bounds.left - bounds.width / 2),
                y: Math.round(e.pageY - bounds.top - bounds.height / 2)
            },
            r = PAN_AREA_DRAG_SIZE,
            d = Math.sqrt(v.x * v.x + v.y * v.y),
            percent = Math.min(d / r, 1);

        if (d < PAN_INACTIVE_AREA) {
            return {
                x: NaN,
                y: NaN
            };
        }

        v = {
            x: v.x / d,
            y: v.y / d
        };

        percent = Math.max(PAN_MIN_PERCENT_SPEED, percent);

        var vnorm = {
            x: -1 * v.x * (percent * PAN_DISTANCE),
            y: -1 * v.y * (percent * PAN_DISTANCE)
        };

        return vnorm;
    }

    function calculatePosition({x, y}) {
        const angle = Math.atan(y / x) + (x > 0 ? Math.PI : 0)
        const cX = 0.5 * Math.cos(angle);
        const cY = 0.5 * Math.sin(angle);
        const toPercent = v => (v + 0.5) * 100;
        const position = `${toPercent(cX)}% ${toPercent(cY)}%`
        return position
    }

});
