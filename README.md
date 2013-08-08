frontend-performance
====================

## Deploying ballpark.js on an Apache-server 

We want Apache to send no-cache headers back to the client.

### Permitting directory-level configurations via .htaccess files

If you are unfamilliar with .htaccess-files, consult the [offical documentation](http://httpd.apache.org/docs/current/howto/htaccess.html).

Here is a crude heuristic tested on Debian 7. 

1. With root privileges, edit /etc/apache2/sites-available/default
2. Set 

'''
	<Directory /var/www/>
    ...
    AllowOverride All
'''

3. Test your configuration by writing gibberish in the .htaccess-file. This should trigger a 500 internal server error when accessing the project root folder from a browser.
