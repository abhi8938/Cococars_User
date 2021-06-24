import * as React from 'react'
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { commonStyles } from './commonStyles';


interface LoaderOverlayProps {
    loading?: boolean
    style?: any
    children?: any
    unmountWhenLoading?: boolean
}

const styles = StyleSheet.create({
    loaderContainer: {
        ...commonStyles.fillParent,
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: 'rgba(255, 255, 255, 1)'
    }
})

function getLoaderContainerStyle(loading: boolean) {


    if(loading) {
        return styles.loaderContainer;
    }

    return commonStyles.hidden;
}



export default class LoaderOverlay extends React.Component<LoaderOverlayProps> {

    render() {
        
        var shouldMount = !this.props.loading;

        if(!this.props.unmountWhenLoading) {
            shouldMount = true;
        }
        

        return (
            <View style={this.props.style} pointerEvents={this.props.loading? 'none': 'auto'}>
                <View style={commonStyles.fillParent}>
                    {shouldMount? this.props.children: null}
                </View>

                <View style={getLoaderContainerStyle(this.props.loading)}>
                    <ActivityIndicator size="large" color="rgb(0, 0, 0)"/>
                </View>
            </View>
        )
    } 
}