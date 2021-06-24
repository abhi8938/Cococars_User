import * as React from 'react';
import { createMemoryHistory } from 'history'
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import { Router, Route, Switch } from 'react-router';
import { observer, Provider } from "mobx-react"
import { observable } from 'mobx';
import SignupPage from './pages/SignupPage';
import LoginService from './service/LoginService';
import ProfilePage from './pages/ProfilePage';
import autobind from 'autobind-decorator';
import LoaderOverlay from './components/LoaderOverlay';
import AddRidePage from './pages/AddRidePage';
import MainPage from './pages/MainPage';
import RideService from './service/RideService';
import RideDetails from './pages/RideDetails';
import FindRidePage from './pages/FindRidePage';
import ListRides from './pages/ListRides';
import NotificationService from './service/NotificationService';
import BookingService from './service/BookingService';
import { bottomTabsState } from './components/BottomTabs';
import PassengerDetails from './pages/PassengerDetails';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

// import RideListenerService from './service/RideListenerService';
import { Alert, BackHandler } from 'react-native';

const browserHistory = createMemoryHistory();
export const routingService = new RouterStore();
const history = syncHistoryWithStore(browserHistory, routingService);
export const rideService = new RideService();
export const loginService = new LoginService();
const notificationService = new NotificationService();
export const bookingService = new BookingService();
// const rideListenerService = new RideListenerService();
@observer
export default class AppRouter extends React.Component {
  constructor(props) {
    super(props);
    notificationService.checkHasPermission();
    notificationService.createChannel();
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }

  @observable
  loading = true;


  handleBackButtonClick() {
    if (routingService.location.pathname === '/') {
      Alert.alert(
        'Exit Cococars?',
        'Exiting the application', [{
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel'
        }, {
          text: 'OK',
          onPress: () => BackHandler.exitApp()
        },], {
          cancelable: false
        }
      )
    } else {
      routingService.replace({
        pathname: '/',
      }); // works best when the goBack is async
    }

    return true;
  }
  async componentDidMount() {
    loginService.loginStatusChanged.subscribe(this.loginStatusChangedHandler);
    loginService.initialize();
    notificationService.messageListener();
    notificationService.NotificationDisplayedListener();
    notificationService.NotificationListener();
    notificationService.NotificationOpened();
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    notificationService.messageListener();
    notificationService.NotificationDisplayedListener();
    notificationService.NotificationListener();
    loginService.loginStatusChanged.unsubscribe(this.loginStatusChangedHandler);
    notificationService.NotificationOpened();
    rideService.Listner;
  }

  @autobind
  async loginStatusChangedHandler() {
    if (loginService.user == null) {
      bottomTabsState.currentTab = 0
      routingService.replace('/signup')
    } else {
      try {
        const Token = await notificationService.getToken();
        loginService.setNotificationToken(Token);
        rideService.Listner = rideService.currentListener(10);
        await rideService.getMyHistoryRides(10);
        notificationService.NotificationOpenedAppClosed();
      }
      catch (err) {
        console.log('err', err)
      }
    }
    this.loading = false
    loginService.getPricingTable()
  }

  renderPage() {
    return (
      <Provider booking={bookingService} routing={routingService} notification={notificationService} login={loginService} rides={rideService}>
        <Router history={history}>
          <Switch>
            <Route path='/privacy' component={Privacy} />
            <Route path='/terms' component={Terms} />
            <Route path='/passenger' component={PassengerDetails} />
            <Route path='/listRides' component={ListRides} />
            <Route path='/findRide' component={FindRidePage} />
            <Route path='/ridedetails' component={RideDetails} />
            <Route path='/signup' component={SignupPage} />
            <Route path='/addride' component={AddRidePage} />
            <Route path='/profile' component={ProfilePage} />
            <Route path='/' component={MainPage} />
          </Switch>
        </Router>
      </Provider>
    )
  }

  render() {
    return (
      <LoaderOverlay loading={this.loading} style={{ flexGrow: 1 }} unmountWhenLoading>
        {this.renderPage()}
      </LoaderOverlay>
    )
  }

}
