import App from './app'
import MyReact from './myReact'

if(process?.env?.REACT_APP_ENV === 'myReact'){
  MyReact()
}else{
  App()
}