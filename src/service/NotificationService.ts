import firebase from 'react-native-firebase';
import { Alert } from "react-native";
import axios from 'axios';
import { RemoteMessage, Notification, NotificationOpen } from 'react-native-firebase';
import { routingService, bookingService, loginService, rideService } from './../AppRouter';
import { observable, toJS } from 'mobx';

export default class NotificationService {


  createChannel() {
    const channel = new firebase.notifications.Android.Channel('test-channel', 'Test Channel', firebase.notifications.Android.Importance.Max)
      .setDescription('My apps test channel');

    // Create the channel
    firebase.notifications().android.createChannel(channel);
  }

  async checkHasPermission() {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      // user has permissions
      return
    } else {
      console.log('not enabled');
      // user doesn't have permission
      try {
        await firebase.messaging().requestPermission();
        Alert.alert('permission granted');
        // User has authorised
      } catch (error) {
        Alert.alert('not granted');
        // User has rejected permissions
      }
    }
  }

  messageListener() {
    firebase.messaging().onMessage((RemoteMessage: any) => {
      // Process your message as required
      console.log(`remote:`, RemoteMessage);
      const notification = new firebase.notifications.Notification()
        .setNotificationId('notificationId')
        .setTitle('My notification title')
        .setBody('My notification body')
        .setData({
          key1: 'value1',
          key2: 'value2',
        })
        .android.setChannelId('test-channel');

      return firebase.notifications().displayNotification(notification);
    });
  }

  NotificationDisplayedListener() {
    return firebase.notifications().onNotificationDisplayed((Notification) => {
      console.log(`notification1`, Notification);
      // Process your notification as required
      // ANDROID: Remote notifications do not contain the channel ID. You will have to specify this manually if you'd like to re-display the notification.
    });
  }

  NotificationListener() {

    return firebase.notifications().onNotification((Notification) => {
      console.log(`notification2`, Notification);
      const notification = new firebase.notifications.Notification()
        .setNotificationId(Notification.notificationId)
        .setTitle(Notification.title)
        .setBody(Notification.body)
        .setData(Notification.data)
        .android.setChannelId('test-channel');

      return firebase.notifications().displayNotification(notification);
      // Process your notification as required
    });
  }

  NotificationOpened() {
    firebase.notifications().onNotificationOpened(async (notificationOpen: NotificationOpen) => {
      // Get the action triggered by the notification being opened
      // Get information about the notification that was opened
      const notification: Notification = notificationOpen.notification;
      if (loginService.user == undefined) {
        return
      }
      return routingService.replace({
        pathname: '/',
        state: notification.data.rideId
      })

    });
  }

  NotificationOpenedAppClosed() {
    firebase.notifications().getInitialNotification()
      .then(async (notificationOpen: NotificationOpen) => {
        if (notificationOpen) {
          const notification: Notification = notificationOpen.notification;
          if (loginService.user == undefined) {
            return
          }
          return routingService.replace({
            pathname: '/',
            state: notification.data.rideId
          })

        } else {
          return routingService.replace({
            pathname: '/',
          })
        }
      });
  }

  async getToken() {
    const token = await firebase.messaging().getToken();
    return (token);
  }

  async sendNotification(Token: string | Array<string>, Title: string, Body: string, data: any) {
    let payload;
    if (Array.isArray(Token)) {
      payload = {
        notification: {
          title: Title,
          body: Body,
          sound: 'default',
          badge: '1',
        },
        data: data,
        registration_ids: Token
      }
    } else {
      payload = {
        notification: {
          title: Title,
          body: Body,
          sound: 'default',
          badge: '1',
        },
        data: data,
        to: Token
      }
    }

    const config = {
      headers: {
        Authorization: 'key=AIzaSyDkrAGMdiRuOto721FGZygPJoaZgUpNfMQ',
        'Content-Type': 'application/json'
      }
    }
    return axios.post('https://fcm.googleapis.com/fcm/send', payload, config)
      .then((result) => {
        return result
      }).catch((error) => {
        return error
      });
  }

}