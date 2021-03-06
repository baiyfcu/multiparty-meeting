import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import * as appPropTypes from './appPropTypes';
import * as requestActions from '../redux/requestActions';
import * as stateActions from '../redux/stateActions';
import PeerView from './PeerView';
import ScreenView from './ScreenView';

class Peer extends Component
{
	state = {
		controlsVisible : false
	};

	handleMouseOver = () =>
	{
		this.setState({
			controlsVisible : true
		});
	};

	handleMouseOut = () =>
	{
		this.setState({
			controlsVisible : false
		});
	};

	render()
	{
		const {
			advancedMode,
			peer,
			micConsumer,
			webcamConsumer,
			screenConsumer,
			onMuteMic,
			onUnmuteMic,
			onDisableWebcam,
			onEnableWebcam,
			onDisableScreen,
			onEnableScreen,
			toggleConsumerFullscreen,
			style
		} = this.props;

		const micEnabled = (
			Boolean(micConsumer) &&
			!micConsumer.locallyPaused &&
			!micConsumer.remotelyPaused
		);

		const videoVisible = (
			Boolean(webcamConsumer) &&
			!webcamConsumer.locallyPaused &&
			!webcamConsumer.remotelyPaused
		);

		const screenVisible = (
			Boolean(screenConsumer) &&
			!screenConsumer.locallyPaused &&
			!screenConsumer.remotelyPaused
		);

		let videoProfile;

		if (webcamConsumer)
			videoProfile = webcamConsumer.profile;

		let screenProfile;

		if (screenConsumer)
			screenProfile = screenConsumer.profile;

		return (
			<div
				data-component='Peer'
				className={classnames({
					screen : screenConsumer
				})}
				onMouseOver={this.handleMouseOver}
				onMouseOut={this.handleMouseOut}
			>
				{videoVisible && !webcamConsumer.supported ?
					<div className='incompatible-video'>
						<p>incompatible video</p>
					</div>
					:null
				}

				<div className={classnames('view-container', 'webcam')} style={style}>
					<div className='indicators'>
						{peer.raiseHandState ?
							<div className={
								classnames(
									'icon', 'raise-hand', {
										on  : peer.raiseHandState,
										off : !peer.raiseHandState
									}
								)
							}
							/>
							:null
						}
					</div>
					<div
						className={classnames('controls', {
							visible : this.state.controlsVisible
						})}
					>
						<div
							className={classnames('button', 'mic', {
								on       : micEnabled,
								off      : !micEnabled,
								disabled : peer.peerAudioInProgress
							})}
							onClick={(e) =>
							{
								e.stopPropagation();
								micEnabled ? onMuteMic(peer.name) : onUnmuteMic(peer.name);
							}}
						/>

						<div
							className={classnames('button', 'webcam', {
								on       : videoVisible,
								off      : !videoVisible,
								disabled : peer.peerVideoInProgress
							})}
							onClick={(e) =>
							{
								e.stopPropagation();
								videoVisible ?
									onDisableWebcam(peer.name) : onEnableWebcam(peer.name);
							}}
						/>

						<div
							className={classnames('button', 'fullscreen')}
							onClick={(e) =>
							{
								e.stopPropagation();
								toggleConsumerFullscreen(webcamConsumer);
							}}
						/>
					</div>
					<PeerView
						advancedMode={advancedMode}
						peer={peer}
						audioTrack={micConsumer ? micConsumer.track : null}
						volume={micConsumer ? micConsumer.volume : null}
						videoTrack={webcamConsumer ? webcamConsumer.track : null}
						videoVisible={videoVisible}
						videoProfile={videoProfile}
						audioCodec={micConsumer ? micConsumer.codec : null}
						videoCodec={webcamConsumer ? webcamConsumer.codec : null}
					/>
				</div>

				{screenConsumer ?
					<div className={classnames('view-container', 'screen')} style={style}>
						<div
							className={classnames('controls', {
								visible : this.state.controlsVisible
							})}
						>
							<div
								className={classnames('button', 'screen', {
									on       : screenVisible,
									off      : !screenVisible,
									disabled : peer.peerScreenInProgress
								})}
								onClick={(e) =>
								{
									e.stopPropagation();
									screenVisible ?
										onDisableScreen(peer.name) : onEnableScreen(peer.name);
								}}
							/>

							<div
								className={classnames('button', 'fullscreen')}
								onClick={(e) =>
								{
									e.stopPropagation();
									toggleConsumerFullscreen(screenConsumer);
								}}
							/>
						</div>
						<ScreenView
							advancedMode={advancedMode}
							screenTrack={screenConsumer ? screenConsumer.track : null}
							screenVisible={screenVisible}
							screenProfile={screenProfile}
							screenCodec={screenConsumer ? screenConsumer.codec : null}
						/>
					</div>
					:null
				}
			</div>
		);
	}
}

Peer.propTypes =
{
	advancedMode             : PropTypes.bool,
	peer                     : appPropTypes.Peer.isRequired,
	micConsumer              : appPropTypes.Consumer,
	webcamConsumer           : appPropTypes.Consumer,
	screenConsumer           : appPropTypes.Consumer,
	onMuteMic                : PropTypes.func.isRequired,
	onUnmuteMic              : PropTypes.func.isRequired,
	onEnableWebcam           : PropTypes.func.isRequired,
	onDisableWebcam          : PropTypes.func.isRequired,
	streamDimensions         : PropTypes.object,
	style                    : PropTypes.object,
	onEnableScreen           : PropTypes.func.isRequired,
	onDisableScreen          : PropTypes.func.isRequired,
	toggleConsumerFullscreen : PropTypes.func.isRequired
};

const mapStateToProps = (state, { name }) =>
{
	const peer = state.peers[name];
	const consumersArray = peer.consumers
		.map((consumerId) => state.consumers[consumerId]);
	const micConsumer =
		consumersArray.find((consumer) => consumer.source === 'mic');
	const webcamConsumer =
		consumersArray.find((consumer) => consumer.source === 'webcam');
	const screenConsumer =
		consumersArray.find((consumer) => consumer.source === 'screen');

	return {
		peer,
		micConsumer,
		webcamConsumer,
		screenConsumer
	};
};

const mapDispatchToProps = (dispatch) =>
{
	return {
		onMuteMic : (peerName) =>
		{
			dispatch(requestActions.mutePeerAudio(peerName));
		},
		onUnmuteMic : (peerName) =>
		{
			dispatch(requestActions.unmutePeerAudio(peerName));
		},
		onEnableWebcam : (peerName) =>
		{

			dispatch(requestActions.resumePeerVideo(peerName));
		},
		onDisableWebcam : (peerName) =>
		{
			dispatch(requestActions.pausePeerVideo(peerName));
		},
		onEnableScreen : (peerName) =>
		{
			dispatch(requestActions.resumePeerScreen(peerName));
		},
		onDisableScreen : (peerName) =>
		{
			dispatch(requestActions.pausePeerScreen(peerName));
		},
		toggleConsumerFullscreen : (consumer) =>
		{
			if (consumer)
				dispatch(stateActions.toggleConsumerFullscreen(consumer.id));
		}
	};
};

const PeerContainer = connect(
	mapStateToProps,
	mapDispatchToProps
)(Peer);

export default PeerContainer;
