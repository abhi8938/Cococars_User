import * as React from 'react';
import Icon from './Icon';

type PreferencesIconProps = {
    type?: string
    level?: number
    style?: any
}

export default class PreferencesIcon extends React.Component<PreferencesIconProps> {

    render() {
        var strike = false; 
        var level = this.props.level;
        if(level == 0) {
            level = 1; 
            strike = true;
        }
        return (
            <Icon icon={`${this.props.type}_${level}`} strike={strike} style={this.props.style}/>
        )
    }
}