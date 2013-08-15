ballpark.js
====================

Ballpark.js is MIT-licensed, see LICENSE.txt.

## How do I run the tests?

After setting up the project on your webserver with correct .htaccess-settings and so forth (se below), point your webbrowser to the root-directory. The tests run in-browser - click 'engage' and you should be all set!

## How do I add my own tests?

1. Create a folder with all the assets you want, and an <code>index.html</code> that loads them.
2. If there is already a category in <code>/tests/</code> matching the content of your test, place your testfolder there. If not, create a new folder in <code>/tests/</code> named after the category in question, and place your testfolder in this newly created folder.
3. Update the <code>TESTRUNNER.data</code> object. The object has a property for each category, containing an array of tests. So if you have created, say, a test combining such-and-such images, add the title of your test to the images-category:
```javascript
...
    TESTRUNNER.data = {
        ...
        images: ["avatars", "1136-pixel-image","2880-pixel-image", "my_new_test"],
        ...
    }
```
## Deploying ballpark.js on an Apache-server 

We want Apache to send no-cache headers back to the client. Therefore, the project contains an .htaccess file that sets these headers. At this time we only have configuration details for Apache, not nginx or other systems.

### Permitting directory-level configurations via .htaccess files

If you are unfamilliar with .htaccess-files, consult the [offical documentation](http://httpd.apache.org/docs/current/howto/htaccess.html).

Here is a crude heuristic tested on Debian 7. 

1. With root privileges, edit /etc/apache2/sites-available/default
2. Set 

```
	<Directory /var/www/>
    ...
    AllowOverride All
```
3. Test your configuration by writing gibberish in the .htaccess-file. This should trigger a 500 internal server error when accessing the project root folder from a browser.

## Weird things

### Why are the custom-font tests base64-encoded?

We were interested in testing the effect of subsetting a font. However, we found that despite having caching disabled, browsers tended not to refetch the font files for each iteration, giving no visible performance difference between the full font and the subset. We believe the base64-encoded versions illustrate the difference better.

## Roadmap

In the future, we want
* A deployment script that automatically creates <code>TESTRUNNER.data</code> from the directory structure in <code>/tests</code>.
* Enable the user to cherry-pick which tests are run via a checkbox in the browser, and let the user decide the number of iterations per test.
