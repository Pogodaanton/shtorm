
import React, { Fragment } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import Loader from '../Loader'
import { UserContext } from '../../contexts/UserContext'

const Home = Loader(import('../Home'))
const Task = Loader(import('../Task'))
const NotFound = Loader(import('../NotFound'))
const Login = Loader(import('../Login'))
const Logout = Loader(import('../Logout'))
const Terminal = Loader(import('../Terminal'))
const BotConfigs = Loader(import('../BotConfigs'))
const Users = Loader(import('../Users'))
const Header = Loader(import('../Header'))
const Start = Loader(import('../Start'))
const DefaultGridContainer = Loader(import('../DefaultGridContainer'))

const AppContent = () => (
  <UserContext.Consumer>
    {({ currentUser }) => {
      const isUserLoggedIn = (Object.keys(currentUser).length > 0)
      return (
        <Switch>
          <Route
            path='/login'
            component={(props) => isUserLoggedIn ? <Redirect to='/' /> : <Login {...props} />}
          />
          <Route path='/'>
            {isUserLoggedIn ? (
              <Fragment>
                <Header />
                <div className='content'>
                  <Switch>
                    <Route
                      path='/p'
                      component={Terminal}
                    />
                    <Route
                      path='/'
                      component={() => null}
                    />
                  </Switch>
                  <DefaultGridContainer name='main'>
                    <Switch>
                      <Route
                        exact
                        path='/'
                        component={Home}
                      />
                      <Route
                        path='/projects/edit/:id'
                        component={Home}
                      />
                      <Route
                        path='/projects/share/:id'
                        component={Home}
                      />
                      <Route
                        path='/projects/start/:id'
                        component={Start}
                      />
                      <Route
                        path='/p/:uuid'
                        component={Task}
                      />
                      <Route
                        path='/users'
                        component={Users}
                      />
                      <Route
                        path='/configs'
                        component={BotConfigs}
                      />
                      <Route
                        path='/logout'
                        component={Logout}
                      />
                      <Route
                        path='/'
                        component={NotFound}
                      />
                    </Switch>
                  </DefaultGridContainer>
                </div>
              </Fragment>
            ) : <Redirect to='/login' />}
          </Route>
        </Switch>
      )
    }}
  </UserContext.Consumer>
)

export default AppContent
