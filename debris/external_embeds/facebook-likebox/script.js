function facebook(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/all.js#xfbml=1";
  fjs.parentNode.insertBefore(js, fjs);
  }

function toBeCalled(){
facebook(document, 'script', 'facebook-jssdk');
console.log(window.performance.getEntries());
}

window.onload = toBeCalled();
