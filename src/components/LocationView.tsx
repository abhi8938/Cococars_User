import React from 'react';
import {
    View, StyleSheet, Animated, Platform, UIManager,
    TouchableOpacity, Text, ViewPropTypes
} from "react-native";
import MapView, { Region } from 'react-native-maps';
import LocationInput from "./LocationInput";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Entypo from "react-native-vector-icons/Entypo";
import fetch from 'react-native-cancelable-fetch';
import autobind from 'autobind-decorator';

const PLACE_DETAIL_URL = 'https://maps.googleapis.com/maps/api/place/details/json';
const DEFAULT_DELTA = { latitudeDelta: 0.015, longitudeDelta: 0.0121 };

type Location = {
    latitude: number
    longitude: number
}

export type LocationViewProps = {
    apiKey: string
    markerColor?: string
    actionButtonStyle?: any
    actionTextStyle?: any
    actionText?: string
    onLocationSelect?: (location: any)=> void
    location?: Location
}

export default class LocationView extends React.Component<LocationViewProps> {

    _map: MapView
    _input: LocationInput

    static defaultProps = {
        markerColor: 'black',
        actionText: 'DONE',
        onLocationSelect: () => ({}),
    };
    state={
        disable:false
    }

    constructor(props) {
        super(props);
        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
        }
    }

    componentDidMount() {

        if(this.props.location) {
            setTimeout(()=>this._setRegion(this.props.location), 300); 
            return;
        }
        setTimeout(this._getCurrentLocation, 300);
    }

   
    region = {
        ...DEFAULT_DELTA,
        latitude: 0, 
        longitude: 0
    }
    

    @autobind
    _onMapRegionChangeComplete(region) {
        this.setState({ disable:true});
        this._setRegion(region, false);
        this._input.fetchAddressForLocation(region);
        this.setState({ disable:false});
    }

    _setRegion(region, animate = true) {
        this.region = {
            ...this.region, 
            latitude: region.latitude, 
            longitude: region.longitude
        
        }
        if(animate) {
            console.log(this.region)
            this._map.animateToRegion(this.region);
        } 
    }

    @autobind
    _onPlaceSelected(placeId: string) {
        fetch(`${PLACE_DETAIL_URL}?key=${this.props.apiKey}&placeid=${placeId}`)
            .then(response => response.json())
            .then(data => {
                let region = (({ lat, lng }) => ({ latitude: lat, longitude: lng }))(data.result.geometry.location);
                this._setRegion(region);
            })
            .catch(err => console.log(`errr`, err));
    }

    @autobind
    _getCurrentLocation() {
        navigator.geolocation.getCurrentPosition(position => {
            let location = {
                latitude: position.coords.latitude, 
                longitude: position.coords.longitude
            }
            this._setRegion(location);
        },error => console.log(`error location`,error));
    }

    @autobind
    async _handleDoneClick() {

        if(!this.props.onLocationSelect) {
            return
        }
        await this._input.fetchAddressForLocation(this.region);

        setTimeout(()=> this.props.onLocationSelect({ ...this.region, address: this._input.getAddress() }))
    }

    render() {
        return (
            <View style={styles.container}>
                <MapView
                    ref={(mapView) => this._map = mapView}
                    style={styles.mapView}
                    showsMyLocationButton={true}
                    showsUserLocation={false}
                    onRegionChangeComplete={this._onMapRegionChangeComplete}
                />
                <Entypo name={'location-pin'} size={30} color={this.props.markerColor} style={{ backgroundColor: 'transparent' }} />
                <View style={styles.fullWidthContainer}>
                    <LocationInput
                        ref={input => this._input = input}
                        apiKey={this.props.apiKey}
                        style={styles.input}
                        onPlaceSelected={this._onPlaceSelected}
                    />
                </View>
                <TouchableOpacity style={[styles.currentLocBtn, { backgroundColor: this.props.markerColor }]} onPress={this._getCurrentLocation}>
                    <MaterialIcons name={'my-location'} color={'white'} size={25} />
                </TouchableOpacity>
                <TouchableOpacity
                    disabled={this.state.disable}
                    style={[styles.actionButton, this.props.actionButtonStyle]}
                    onPress={this._handleDoneClick}
                >
                    <View>
                        <Text style={[styles.actionText, this.props.actionTextStyle]}>{this.props.actionText}</Text>
                    </View>
                </TouchableOpacity>
                {this.props.children}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    mapView: {
        ...StyleSheet.absoluteFillObject
    },
    fullWidthContainer: {
        position: 'absolute',
        width: '100%',
        top: 54,
        alignItems: 'center',
    },
    input: {
        width: '90%',
        padding: 5
    },
    currentLocBtn: {
        backgroundColor: '#000',
        padding: 5,
        borderRadius: 5,
        position: 'absolute',
        bottom: 80,
        right: 10,
    },
    actionButton: {
        backgroundColor: '#000',
        height: 50,
        position: 'absolute',
        bottom: 20,
        left: 10,
        right: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
    },
    actionText: {
        color: 'white',
        fontSize: 23,
    }
});
