import React from 'react';
import ReactDOM from 'react-dom';

// include your styles
import './styles/basic.scss';
import './styles/basic.less';

// import './component/button';
import 'component/button';
import statham from 'images/statham.png';

const title = 'My Minimal React Webpack Tailwind Setup';
const name = "image";


/**
 * this is workaround for purgecss
 * or you can use whitelist in the webpack.config
 * image__statham
 */

ReactDOM.render(
  <div>
    <div className="title">{title}</div>
    <img src={statham} className={name + '__statham'} />
  </div>,
  document.getElementById('app')
);

// you can load scripts asynchron and load it in separate chunck
// import('hgdfghgfd').then(() => {
//  console.log('async');
//
// })

console.log('Hello World');

console.log('Public: ', PUBLIC_PATH);



