import * as React from 'react'
import autobind from 'autobind-decorator'
import {observer} from 'mobx-react'
import { observable } from 'mobx'
import { StyleSheet, TouchableOpacity, Image } from 'react-native';
import NativeImagePicker from 'react-native-image-picker';
import LoaderOverlay from './LoaderOverlay';
import { commonStyles } from './commonStyles';






type ImagePickerProps = {
    source?: string;
    size?: number;
    style?: any
    onImageLoaded?: (source: string) => void
}

@observer
export default class ImagePicker extends React.Component<ImagePickerProps> {

    @observable 
    loading = false;

    @autobind
    async handleClick() {

        this.loading = true;

        try {
            var uri = await this.showImagePicker(); 
            if(this.props.onImageLoaded) {
                this.props.onImageLoaded(uri);
            }
        } catch(err) {
            console.log(err)
        }

        this.loading = false;
    }


    showImagePicker(): Promise<string> {
        const options = {
            title: 'Select Avatar',
            storageOptions: {
                skipBackup: true,
                path: 'images',
            },
        };

        var resolve; 
        var reject;

        var retPromise = new Promise<string>((res, rej)=> {
            resolve = res; 
            reject = rej;
        });

        NativeImagePicker.showImagePicker(options, response => {
            if (response.didCancel) {
                reject(new Error('User cancelled image picker'));

            } else if (response.error) {
                reject(new Error(response.error));
            } else {

                resolve(`data:image/jpeg;base64,${response.data}`);
            }
        })

        return retPromise;
        
    }
	

    render() {
        var source = this.props.source? {uri: this.props.source} : require('../../assets/profile.png'); 

        var size = this.props.size || 110;

        var containerStyle = {
            borderRadius: 0.5 * size, 
            width: size, 
            height: size,
            overflow: 'hidden',
            ...this.props.style
        }

        return (
            <LoaderOverlay loading={this.loading} style={containerStyle}>
                <TouchableOpacity onPress={this.handleClick} style={commonStyles.fillParent}>
                    <Image resizeMode='cover' source={source} style={commonStyles.fillParent}/>
                </TouchableOpacity>
            </LoaderOverlay>
        )
    }
}