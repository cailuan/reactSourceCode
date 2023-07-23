import { myReact } from "./myreact";
import { originReact } from "./app";

if(process.env.REACT_APP_NOT_SECRET_CODE == 'ORIGIN') {
  document.title = '源码'
  originReact()
 
}else{
  document.title = 'myself'
  myReact()

} 