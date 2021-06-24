import React from 'react';
import { TextInput, View, StyleSheet, Animated, TouchableOpacity } from "react-native";
import LocationListView from "./LocationListView";
import debounce from "debounce-decorator";
import fetch from 'react-native-cancelable-fetch';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import autobind from 'autobind-decorator';

const styles = StyleSheet.create({
    textInputContainer: {
        flexDirection: 'row',
        height: 40,
        zIndex: 99,
        paddingLeft: 10,
        borderRadius: 5,
        backgroundColor: 'white',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowRadius: 2,
        shadowOpacity: 0.24,
        alignItems: 'center'
    },
    textInput: {
        flex: 1,
        fontSize: 17,
        color: '#404752'
    },
    btn: {
        width: 30,
        height: 30,
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    listViewContainer: {
        paddingLeft: 3,
        paddingRight: 3,
        paddingBottom: 3
    }
});

const AUTOCOMPLETE_URL = "https://maps.googleapis.com/maps/api/place/autocomplete/json";
const REVRSE_GEO_CODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";

type LocationInputProps = {
    apiKey: string
    language?: string
    style?: any
    onPlaceSelected?: (placeId: string)=> void
}

type LocationInputState = {
    predictions: Array<any>
    loading: boolean
    text: string
}

export default class LocationInput extends React.Component<LocationInputProps, LocationInputState> {

    _input: TextInput

    static defaultProps = {
        language: 'en'
    };

    componentWillUnmount() {
        this._abortRequest();
    }

    state = {
        predictions: [],
        loading: false,
        text: ""
    };

    _abortRequest(){
        fetch.abort(this);
    };

    fetchAddressForLocation(location): Promise<void> {
        this.setState({ loading: true, predictions: [] });
        let { latitude, longitude } = location;
        return fetch(`${REVRSE_GEO_CODE_URL}?key=${this.props.apiKey}&latlng=${latitude},${longitude}`, null, this)
            .then(res => res.json())
            .then(data => {
                this.setState({ loading: false });
                let { results } = data;
                if (results.length > 0) {
                    let { formatted_address } = results[0];
                    this.setState({ text: formatted_address });
                }
            });
    }

    @debounce(300)
    _request(text) {
        this._abortRequest();
        if (text.length >= 3) {
            fetch(`${AUTOCOMPLETE_URL}?input=${encodeURIComponent(text)}&key=${this.props.apiKey}&language=${this.props.language}`, null, this)
                .then(res => res.json())
                .then(data => {
                    let { predictions } = data;
                    this.setState({ predictions });
                });
        } else {
            this.setState({ predictions: [] });
        }
    }

    @autobind
    _onChangeText(text) {
        this._request(text);
        this.setState({ text });
    }

    @autobind
    _onFocus() {
        this._abortRequest();
    }


    @autobind
    _onPressClear() {
        this._abortRequest();
        this.setState({ text: '', predictions: [], });
        
    }

    _getClearButton() {
        return (
            <TouchableOpacity style={styles.btn} onPress={this._onPressClear}>
                <MaterialIcons name={'clear'} size={20} />
            </TouchableOpacity>
        ) ;
    }

    getAddress() {
        return this.state.loading ? '' : this.state.text;
    }

    render() {
        return (
            <View style={this.props.style}>
                <View style={styles.textInputContainer}>
                    <TextInput
                        ref={input => this._input = input}
                        value={this.state.loading ? 'Loading...' : this.state.text}
                        style={styles.textInput}
                        underlineColorAndroid={'transparent'}
                        placeholder={'Search'}
                        onFocus={this._onFocus}
                        onChangeText={this._onChangeText}
                        autoCorrect={false}
                        spellCheck={false}
                    />
                    {this._getClearButton()}
                </View>
                <View style={styles.listViewContainer}>
                    <LocationListView
                        onPlaceSelected={this.props.onPlaceSelected}
                        predictions={this.state.predictions}
                    />
                </View>
            </View>
        );
    }
}