import React, {Component} from 'react';

/**
 * The footer component
 * Basically, it is taken from Rhys Welsh Website
 * Therefore, it consists in an integration of HTML (taken on Rhys website)
 * Remember that direct integration of HTML in react is dangerous
 */
export default class Footer extends Component {
    // constructor(props){
    //   super(props);
    // }
    render() {
    var icon1 = process.env.PUBLIC_URL + '/social-icon1.png'; 
    var icon2 = process.env.PUBLIC_URL + '/social-icon2.png'; 
    var icon3 = process.env.PUBLIC_URL + '/social-icon3.png'; 
    var icon4 = process.env.PUBLIC_URL + '/social-icon4.png'; 
    var icon5 = process.env.PUBLIC_URL + '/social-icon5.png'; 
    var skyline = process.env.PUBLIC_URL + '/skyline.png'; 
      var html = '<div class="moduletable"> <img class= "skyline-img" src="' + skyline + '" alt="Cardiff Web Design and Graphics | Rhys Welsh"></div></div><footer><div class="container"><div class="footer-top"><div class="footer-social"><div class="moduletable"><div class="custom"  ><ul><li><a href="https://www.rhyswelsh.com/contact-rhys-welsh.html" target="_blank"><img src="'+ icon1 + '"></a></li><li><a target="_blank" href="https://en-gb.facebook.com/pages/Rhys-Welsh-Freelance-Web-Designer-in-Cardiff/144859608879568"><img src="' + icon2 + '"></a></li><li><a href="http://www.twitter.com/rhyswelsh" target="_blank"><img src="' + icon3 + '"></a></li><li><a href="https://plus.google.com/+RhysWelsh" target="_blank"><img src="' + icon4 + '"></a></li><li><a href="https://www.instagram.com/rhys.welsh/" target="_blank"><img src="' + icon5 + '"></a></li></ul></div></div></div></div><div class="footer-detail"><div class="moduletable"><div class="custom"  ><div><a href="/terms-and-conditions.html"><strong>Terms &amp; Conditions</strong></a> | <strong><a href="/privacy-policy.html">Privacy Policy </a></strong>|&nbsp; <a href="/index.php">Web Design Cardiff</a> | VAT Reg. No. 215 5832 16 | Rhys Welsh is a trading name of Rhys Welsh Ltd Company Reg No. 07934978 Registered in England &amp; Wales | Chapel Studios, Newport Road, Old St Mellons, Cardiff, CF35UB | <a href="/component/xmap/?Itemid=138">Sitemap</a></div></div></div></div><div class="copyright"><div class="moduletable"><div class="custom"  ><div><a href="/index.php"></a></div></div></div></div> </footer>'
      return (
        <div className="content" dangerouslySetInnerHTML={{__html: html}}></div>
      )
    }
}