import React, { PureComponent } from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import { fontStyles } from '../../../styles/common';
import { connect } from 'react-redux';
import DefaultTabBar from 'react-native-scrollable-tab-view/DefaultTabBar';
import AddCustomToken from '../../UI/AddCustomToken';
import SearchTokenAutocomplete from '../../UI/SearchTokenAutocomplete';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import PropTypes from 'prop-types';
import { strings } from '../../../../locales/i18n';
import AddCustomCollectible from '../../UI/AddCustomCollectible';
import { getNetworkNavbarOptions } from '../../UI/Navbar';
import { NetworksChainId } from '@metamask/controllers';
import CollectibleDetectionModal from '../../UI/CollectibleDetectionModal';
import { isMainNet } from '../../../util/networks';
import { ThemeContext, mockTheme } from '../../../util/theme';

const createStyles = (colors) =>
	StyleSheet.create({
		wrapper: {
			flex: 1,
			backgroundColor: colors.background.default,
		},
		infoWrapper: {
			alignItems: 'center',
			marginTop: 10,
		},
		tabUnderlineStyle: {
			height: 2,
			backgroundColor: colors.primary.default,
		},
		tabStyle: {
			paddingBottom: 0,
		},
		textStyle: {
			fontSize: 16,
			letterSpacing: 0.5,
			...fontStyles.bold,
		},
	});

/**
 * PureComponent that provides ability to add assets.
 */
class AddAsset extends PureComponent {
	state = {
		address: '',
		symbol: '',
		decimals: '',
		dismissNftInfo: false,
	};

	static propTypes = {
		/**
		/* navigation object required to push new views
		*/
		navigation: PropTypes.object,
		/**
		 * Chain id
		 */
		chainId: PropTypes.string,
		/**
		 * Object that represents the current route info like params passed to it
		 */
		route: PropTypes.object,
		/**
		 * Boolean to show if NFT detection is enabled
		 */
		useCollectibleDetection: PropTypes.bool,
	};

	updateNavBar = () => {
		const { navigation, route } = this.props;
		const colors = this.context.colors || mockTheme.colors;
		navigation.setOptions(
			getNetworkNavbarOptions(
				`add_asset.${route.params.assetType === 'token' ? 'title' : 'title_nft'}`,
				true,
				navigation,
				colors
			)
		);
	};

	componentDidMount = () => {
		this.updateNavBar();
	};

	componentDidUpdate = () => {
		this.updateNavBar();
	};

	renderTabBar() {
		const colors = this.context.colors || mockTheme.colors;
		const styles = createStyles(colors);

		return (
			<DefaultTabBar
				underlineStyle={styles.tabUnderlineStyle}
				activeTextColor={colors.primary.default}
				inactiveTextColor={colors.text.muted}
				backgroundColor={colors.background.default}
				tabStyle={styles.tabStyle}
				textStyle={styles.textStyle}
			/>
		);
	}

	dismissNftInfo = async () => {
		this.setState({ dismissNftInfo: true });
	};

	render = () => {
		const {
			route: {
				params: { assetType, collectibleContract },
			},
			navigation,
			chainId,
			useCollectibleDetection,
		} = this.props;
		const { dismissNftInfo } = this.state;
		const colors = this.context.colors || mockTheme.colors;
		const styles = createStyles(colors);

		return (
			<SafeAreaView style={styles.wrapper} testID={`add-${assetType}-screen`}>
				{isMainNet(chainId) && assetType !== 'token' && !dismissNftInfo && !useCollectibleDetection && (
					<View style={styles.infoWrapper}>
						<CollectibleDetectionModal onDismiss={this.dismissNftInfo} navigation={navigation} />
					</View>
				)}
				{assetType === 'token' ? (
					<ScrollableTabView renderTabBar={() => this.renderTabBar()}>
						{NetworksChainId.mainnet === this.props.chainId && (
							<SearchTokenAutocomplete
								navigation={navigation}
								tabLabel={strings('add_asset.search_token')}
								testID={'tab-search-token'}
							/>
						)}
						<AddCustomToken
							navigation={navigation}
							tabLabel={strings('add_asset.custom_token')}
							testID={'tab-add-custom-token'}
						/>
					</ScrollableTabView>
				) : (
					<AddCustomCollectible
						navigation={navigation}
						collectibleContract={collectibleContract}
						testID={'add-custom-collectible'}
					/>
				)}
			</SafeAreaView>
		);
	};
}

AddAsset.contextType = ThemeContext;

const mapStateToProps = (state) => ({
	chainId: state.engine.backgroundState.NetworkController.provider.chainId,
	useCollectibleDetection: state.engine.backgroundState.PreferencesController.useCollectibleDetection,
});

export default connect(mapStateToProps)(AddAsset);
