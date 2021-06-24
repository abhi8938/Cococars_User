import React, {Component} from 'react';
import {Platform, SafeAreaView} from 'react-native';
import AppRouter from './src/AppRouter'


interface Props {}
export default class App extends Component<Props> {
  render() {
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
        <AppRouter/>
      </SafeAreaView>
    );
  }
}

if(Platform.OS === 'android') { // only android needs polyfill
  require('intl'); // import intl object
  require('intl/locale-data/jsonp/en-IN'); // load the required locale details
}


