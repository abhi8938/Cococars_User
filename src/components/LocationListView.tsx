import React from 'react';
import {
	FlatList, Text, View, StyleSheet, TouchableOpacity, LayoutAnimation
} from "react-native";

import autobind from 'autobind-decorator';

const styles = StyleSheet.create({
	row: {
		width: '100%',
		height: 50,
		justifyContent: 'center',
		paddingLeft: 8,
		paddingRight: 5
	},
	list: {
		backgroundColor: 'white',
		borderBottomRightRadius: 10,
		borderBottomLeftRadius: 10,
		maxHeight: 220
	},
	listContainer: {
		shadowOffset: {
			width: 0,
			height: 2
		},
		shadowRadius: 2,
		shadowOpacity: 0.24,
		backgroundColor: 'transparent',
		borderBottomRightRadius: 10,
		borderBottomLeftRadius: 10,
	},
	separator: {
		height: StyleSheet.hairlineWidth,
		backgroundColor: 'rgba(0,0,0,0.3)'
	},
	primaryText: {
		color: '#545961',
		fontSize: 14
	},
	secondaryText: {
		color: '#A1A1A9',
		fontSize: 13
	}
});

type LocationListViewProps = {
	predictions: Array<any>
	onPlaceSelected?: (placeId: string)=> void
}

export default class LocationListView extends React.Component<LocationListViewProps> {


	componentDidUpdate() {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
	}


	handlePlaceSelected(placeId: string) {
		if(this.props.onPlaceSelected) {
			this.props.onPlaceSelected(placeId)
		}
	}

	@autobind
	_renderItem({ item }) {
		const { structured_formatting } = item;
		return (
			<TouchableOpacity onPress={() => this.handlePlaceSelected(item.place_id)}>
				<View style={styles.row}>
					<Text
						style={styles.primaryText}
						numberOfLines={1}
					>
						{structured_formatting.main_text}
					</Text>
					<Text
						style={styles.secondaryText}
						numberOfLines={1}
					>
						{structured_formatting.secondary_text}
					</Text>
				</View>
			</TouchableOpacity>
		)
	}

	_getFlatList() {
		return (
			<FlatList
				showsVerticalScrollIndicator={false}
				style={[styles.list, null]}
				data={this.props.predictions}
				renderItem={this._renderItem}
				ItemSeparatorComponent={() => <View style={styles.separator} />}
				keyboardShouldPersistTaps={'handled'}
				keyExtractor={item => item.id}
			/>
		);
	};

	render() {
		return (
			<View style={styles.listContainer}>{this._getFlatList()}</View>
		)
	}
}